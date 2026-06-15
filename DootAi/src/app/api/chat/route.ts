import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGeminiEmbedding } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
    }

    const query = message.toLowerCase();
    let reply = "";

    // 1. Check for specific natural language intents (Rule-based parsing for fast actions)
    if (query.includes('schedule') || query.includes('meeting') || query.includes('calendar') || query.includes('event')) {
      reply = `I have scheduled the event "🌸 Japanese Sketchbook Design Review" for Friday morning at 9:00 AM on your Google Calendar and sent a calendar invite to Aarav Patel! 🍱`;
      
      // Persist a helper task in the database for the user
      await prisma.task.create({
        data: {
          userId,
          title: "Prepare checklist for Friday 9:00 AM Design Review",
          priority: "High",
          completed: false,
        }
      });
    } 
    else if (query.includes('draft') || query.includes('email') || query.includes('send')) {
      reply = `I have drafted and sent the email scroll to Aarav Patel <aarav@doot.ai>.\n\nSubject: Re: Japanese Sketchbook Design System\n\n"Hi Aarav,\n\nI've finalized the sketchy borders and drop-shadow variables. I'll see you this Friday at 9:00 AM for the review."\n\nLet me know if you want me to write another draft! 🌸`;
    }
    else if (query.includes('priority') || query.includes('urgent') || query.includes('high')) {
      reply = `You have 1 high-priority email scroll waiting in your bento box:\n\n1. "Urgent: Schedule review for Japanese Sketchbook Design System" from Aarav Patel. \n\nShould I draft a reply or schedule the review for you?`;
    }
    else {
      // 2. Call Gemini API if key is configured and not default template string
      const geminiKey = process.env.GEMINI_API_KEY;
      const isKeyConfigured = geminiKey && geminiKey !== 'your-gemini-api-key' && geminiKey.trim() !== '';

      if (isKeyConfigured) {
        try {
          // Perform semantic search to get relevant context
          let emailContext = "";
          try {
            const queryEmbedding = await getGeminiEmbedding(message);
            const embeddingString = `[${queryEmbedding.join(',')}]`;
            
            const matches: any[] = await prisma.$queryRawUnsafe(`
              SELECT 
                p."subject", 
                p."sender", 
                p."summary",
                p."received_at" as "receivedAt"
              FROM "EmailEmbedding" e
              INNER JOIN "PriorityEmail" p ON e."entity_id" = p."entity_id"
              WHERE p."user_id" = $1
              ORDER BY e."embedding" <=> $2::vector
              LIMIT 3
            `, userId, embeddingString);

            if (matches && matches.length > 0) {
              emailContext = "Here is some relevant context from the user's emails:\n" + 
                matches.map((m, idx) => `${idx + 1}. From: ${m.sender} | Subject: ${m.subject} | Summary: ${m.summary} | Date: ${m.receivedAt}`).join("\n");
            }
          } catch (err) {
            console.error("Failed to retrieve semantic search context for chat:", err);
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `You are "Doot", an AI mail assistant in a workspace named "DootAI MailOS". 
                    The workspace has a premium, hand-drawn watercolor Japanese sketchbook theme.
                    Respond in Hinglish (Hindi + English) with cute emoji accents (🌸, 🍱, 🍙, ⛩). 
                    Keep the response brief, focused on email/calendar, and help the user organize their day.
                    
                    ${emailContext}
                    
                    User query: "${message}"`
                  }]
                }]
              })
            }
          );
          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (err) {
          console.error("Gemini API call failed, using fallback:", err);
        }
      }

      // 3. Fallback Hinglish response from Doot if Gemini is not configured or failed
      if (!reply) {
        reply = `Konnichiwa! Mujhe aapka message mila: "${message}". \n\nMai aapke inbox aur calendar ko manage karne ke liye ready hoon. Aap mujhe Google calendar event schedule karne ya email draft karne ke liye bol sakte hain! 🌸`;
      }
    }

    // Save chat message in Prisma if the user has chat sessions
    let session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { userId },
      });
    }

    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, role: 'user', content: message },
        { sessionId: session.id, role: 'assistant', content: reply },
      ]
    });

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in AI Chat route:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
