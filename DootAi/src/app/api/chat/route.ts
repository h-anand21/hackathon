import { NextRequest, NextResponse } from 'next/server';
import { prisma, resolveUserId } from '@/lib/db';
import { getGeminiEmbedding } from '@/lib/ai';
import { corsair } from '@/lib/corsair';
import fs from 'fs';
import path from 'path';

const eventsFilePath = path.join(process.cwd(), "src/lib/data/events.json");

function readLocalEvents() {
  try {
    if (!fs.existsSync(eventsFilePath)) {
      return [];
    }
    const content = fs.readFileSync(eventsFilePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (e) {
    console.error("Error reading local events:", e);
    return [];
  }
}

function writeLocalEvents(events: any[]) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error("Error writing local events:", e);
    return false;
  }
}

function generateFallbackEmail(query: string, toEmail: string) {
  let subject = "Discussion";
  let body = "Hi,\n\nI am writing this email regarding our discussion.\n\nBest regards,\nHimanshu";

  const lowerQuery = query.toLowerCase();

  // 1. Sick / Leave request
  if (lowerQuery.includes("sick") || lowerQuery.includes("leave") || lowerQuery.includes("fever") || lowerQuery.includes("unwell") || lowerQuery.includes("ill")) {
    subject = "Leave Request - Sick Leave 🤒";
    body = `Hi,\n\nI am writing to inform you that I am feeling unwell today and need to take sick leave. I will keep you updated on my recovery.\n\nBest regards,\nHimanshu`;
  }
  // 2. Marriage / Wedding
  else if (lowerQuery.includes("marriage") || lowerQuery.includes("marrage") || lowerQuery.includes("wedding")) {
    let relative = "my brother";
    if (lowerQuery.includes("sister")) relative = "my sister";
    else if (lowerQuery.includes("friend")) relative = "my friend";
    else if (lowerQuery.includes("cousin")) relative = "my cousin";
    
    subject = `Wedding Invitation: Celebration of ${relative}'s Marriage! 🌸`;
    body = `Hi,\n\nI hope you are doing well.\n\nI am absolutely delighted to invite you to the wedding ceremony and celebrations of ${relative}. It would mean the world to us to have your presence and blessings on this auspicious occasion.\n\nPlease find the details of the venue and schedule attached below. We look forward to celebrating this beautiful milestone together!\n\nWarm regards,\nHimanshu`;
  }
  // 3. Celebration / Party / Happiness / General Invitation
  else if (
    lowerQuery.includes("celebration") || lowerQuery.includes("party") || 
    lowerQuery.includes("happiness") || lowerQuery.includes("hapapaines") || 
    lowerQuery.includes("hapapiness") || lowerQuery.includes("occosene") || 
    lowerQuery.includes("occasion") ||
    (
      (lowerQuery.includes("invite") || lowerQuery.includes("invitation")) && 
      !lowerQuery.includes("meeting") && !lowerQuery.includes("metting") && 
      !lowerQuery.includes("schedule") && !lowerQuery.includes("sync") && 
      !lowerQuery.includes("call")
    )
  ) {
    subject = "Invitation to Celebrate! 🌸";
    body = `Hi,\n\nI hope you are doing well.\n\nI am absolutely delighted to invite you to join us for a celebration on this special occasion. It would mean a lot to us to have your presence to share in our happiness.\n\nPlease let me know if you will be able to make it.\n\nBest regards,\nHimanshu`;
  }
  // 4. Doctor Appointment (specifically patient request)
  else if (
    (lowerQuery.includes("doctor") || lowerQuery.includes("docot") || lowerQuery.includes("appoint") || lowerQuery.includes("hospital")) &&
    !lowerQuery.includes("party") && !lowerQuery.includes("happiness") && !lowerQuery.includes("hapapaines") && !lowerQuery.includes("occosene") && !lowerQuery.includes("occasion") && !lowerQuery.includes("invite")
  ) {
    subject = "Doctor Appointment Request 🏥";
    body = `Dear Doctor,\n\nI would like to request an appointment for a consultation. Please let me know your available time slots this week.\n\nBest regards,\nHimanshu`;
  }
  // 5. Meeting / Sync
  else if (lowerQuery.includes("meeting") || lowerQuery.includes("metting") || lowerQuery.includes("schedule") || lowerQuery.includes("sync") || lowerQuery.includes("catch up") || lowerQuery.includes("call")) {
    subject = "Meeting Invitation / Sync Request 🗓️";
    body = `Hi,\n\nI would like to request a brief meeting or sync-up to discuss our ongoing work and align on the next steps.\n\nPlease let me know your availability for a 15-30 minute slot this week, or send over a calendar invite at your convenience.\n\nBest regards,\nHimanshu`;
  }
  // 7. General message parsing (e.g. "saying I will join the review Friday")
  else {
    let sayingContent = "";
    const sayingMatch = query.match(/(?:saying|tell them|that)\s+([^,.\n?]+)/i);
    if (sayingMatch && sayingMatch[1] && sayingMatch[1].trim().length > 3) {
      sayingContent = sayingMatch[1].trim();
    }

    if (sayingContent) {
      const formattedSaying = sayingContent.charAt(0).toUpperCase() + sayingContent.slice(1);
      subject = "Discussion Update";
      body = `Hi,\n\nI hope this email finds you well.\n\nI am sending this email to let you know that:\n\n${formattedSaying}.\n\nBest regards,\nHimanshu`;
    } else {
      let extractedAbout = "";
      const aboutMatch = query.match(/(?:about|regarding|for|on behalf of|on behave of|behalf of|behave of|subject)\s+([^,.\n?]+)/i);
      if (aboutMatch && aboutMatch[1] && aboutMatch[1].trim().length > 2) {
        extractedAbout = aboutMatch[1].trim();
        if (extractedAbout.toLowerCase().startsWith("to ")) {
          extractedAbout = extractedAbout.slice(3).trim();
        }
      }

      if (extractedAbout) {
        // Capitalize words in subject
        subject = extractedAbout.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        body = `Hi,\n\nI hope this email finds you well.\n\nI am writing to reach out regarding: ${extractedAbout}.\n\nPlease let me know your thoughts on this when you have a moment, or if you would like to hop on a quick call to discuss further.\n\nBest regards,\nHimanshu`;
      } else {
        subject = "Discussion Topic";
        body = `Hi,\n\nI hope this email finds you well.\n\nI am writing this email regarding our conversation. Please let me know when you are free to discuss.\n\nBest regards,\nHimanshu`;
      }
    }
  }

  return { subject, body };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get('userId');

    if (!rawUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const userId = await resolveUserId(rawUserId);

    const session = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const formattedMessages = session.messages.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (error: any) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: rawUserId, message } = await request.json();

    if (!rawUserId || !message) {
      return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
    }

    const userId = await resolveUserId(rawUserId);

    const query = message.trim().toLowerCase();
    
    // Check if user is confirming/sending the latest draft
    const isConfirmationOnly = (
      ["yes", "send", "haa", "bhej do", "confirm", "send it", "bhej do please", "bhejdo", "send now", "ok", "ok send", "approve", "confirm send"].includes(query) ||
      ( (query.includes("send") || query.includes("haa") || query.includes("yes") || query.includes("bhej do") || query.includes("confirm")) && 
        !query.includes("@") && !query.includes("to ") && !query.includes("subject") && !query.includes("email to") && query.length < 35 )
    );

    if (isConfirmationOnly) {
      const latestDraft = await prisma.priorityEmail.findFirst({
        where: { userId, category: 'Drafts' },
        orderBy: { receivedAt: 'desc' }
      });

      if (latestDraft) {
        const corsairEntity = await prisma.corsairEntity.findUnique({
          where: { id: latestDraft.entityId }
        });

        if (corsairEntity) {
          const emailData = corsairEntity.data as any;
          const to = emailData.to || 'aarav@doot.ai';
          const subject = emailData.subject || 'Fwd: Email Scroll';
          const body = emailData.body || '';

          // 1. Send using Corsair
          try {
            let gmailAccount = await prisma.corsairAccount.findFirst({
              where: {
                tenantId: userId,
                integration: { name: 'gmail' }
              }
            });

            let targetTenantId = userId;
            if (!gmailAccount) {
              gmailAccount = await prisma.corsairAccount.findFirst({
                where: {
                  integration: { name: 'gmail' }
                }
              });
              if (gmailAccount) {
                targetTenantId = gmailAccount.tenantId;
              }
            }

            if (gmailAccount) {
              const tenant = corsair.withTenant(targetTenantId);
              const mimeMessage = [
                `To: ${to}`,
                `Subject: ${subject}`,
                'Content-Type: text/plain; charset=utf-8',
                'MIME-Version: 1.0',
                '',
                body,
              ].join('\r\n');

              const raw = Buffer.from(mimeMessage)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

              await tenant.gmail.api.messages.send({
                userId: 'me',
                raw,
              });
            }
          } catch (gmailErr) {
            console.warn("Could not send real Gmail on confirmation, logging mock instead:", gmailErr);
          }

          // 2. Update category from Drafts to Sent in both CorsairEntity and PriorityEmail
          await prisma.corsairEntity.update({
            where: { id: corsairEntity.id },
            data: {
              data: {
                ...emailData,
                category: 'Sent'
              }
            }
          });

          await prisma.priorityEmail.update({
            where: { id: latestDraft.id },
            data: {
              category: 'Sent',
              summary: `Sent email regarding: ${subject}`
            }
          });

          const reply = `I have successfully sent your draft email to **${to}** with subject **"${subject}"**! 🌸 Bento box is updated.`;

          // Save chat messages in history
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
        }
      }
    }

    let reply = "";
    let actions: any[] = [];
    let modelUsed = "";

    // 1. Context retrieval via embedding
    let emailContext = "";
    let matches: any[] = [];
    try {
      const queryEmbedding = await getGeminiEmbedding(message);
      const embeddingString = `[${queryEmbedding.join(',')}]`;
      
      matches = await prisma.$queryRawUnsafe(`
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

    // Check API keys
    const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.replace(/['"]/g, '').trim() : '';
    const openaiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.replace(/['"]/g, '').trim() : '';

    const isGeminiConfigured = geminiKey && geminiKey !== 'your-gemini-api-key' && geminiKey !== '';
    const isOpenAIConfigured = openaiKey && openaiKey !== 'your-openai-api-key' && openaiKey !== '';

    const todayDate = new Date();
    const currentDayVal = todayDate.getDay();
    const daysToMonVal = currentDayVal === 0 ? -6 : 1 - currentDayVal;
    const mondayOfCurrentWeekVal = new Date(todayDate);
    mondayOfCurrentWeekVal.setDate(todayDate.getDate() + daysToMonVal);

    const mondayStr = mondayOfCurrentWeekVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const sundayOfCurrentWeekVal = new Date(mondayOfCurrentWeekVal);
    sundayOfCurrentWeekVal.setDate(mondayOfCurrentWeekVal.getDate() + 6);
    const sundayStr = sundayOfCurrentWeekVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const promptText = `You are "Doot", an AI assistant in DootAI MailOS, a workspace with a beautiful watercolor Japanese sketchbook theme.
You must respond in English with cute emoji accents (🌸, 🍱, 🍙, ⛩).
The current local time is ${todayDate.toISOString()}.
The calendar UI is displaying the current week of ${mondayStr} to ${sundayStr}.
If the user asks you to schedule a meeting, event, or task on the calendar, schedule it within this week. For example, if today is ${todayDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}, calculate relative days (like "tomorrow" or "this Friday") correctly. Use the correct year, month, and date for all scheduled events so they show up on the calendar UI.

Analyze the user's message to see if they want to:
1. Schedule a calendar event/meeting.
2. Send, draft, or forward an email.
3. Both.

You must output your response in JSON format. The JSON must have this structure:
{
  "actions": [
    // Include this action if a calendar event should be scheduled
    {
      "type": "schedule_event",
      "title": "Event Title (e.g. 🍱 Bento Discussion)",
      "description": "Short description of the event",
      "start": "ISO 8601 Datetime string (e.g., 2026-06-18T11:00:00)",
      "end": "ISO 8601 Datetime string (e.g., 2026-06-18T12:00:00)",
      "location": "Location (e.g., DootAI Lounge or Google Meet)"
    },
    // Include this action if an email should be sent, drafted, or forwarded
    {
      "type": "send_email",
      "to": "Recipient email address (extract from message, or use contact email, e.g. aarav@doot.ai)",
      "subject": "Email subject",
      "body": "Complete draft body of the email"
    }
  ],
  "reply": "Your English conversational response confirming what actions you are performing and formatting the details of the email (to, subject, snippet) and calendar event (title, time, location) in a clear checklist/summary format."
}

${emailContext}

User query: "${message}"`;

    let aiResponseText = "";

    if (isGeminiConfigured) {
      try {
        console.log('[Chat] Generating response using Gemini 2.5 Flash...');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: promptText
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (aiResponseText) {
            modelUsed = "Gemini 2.5 Flash";
          }
        } else {
          console.warn(`Gemini 2.5 Flash call failed with status ${response.status}. Trying Gemini 1.5 Flash fallback...`);
        }
      } catch (err) {
        console.error("Gemini 2.5 Flash API call failed:", err);
      }
    }

    if (!aiResponseText && isGeminiConfigured) {
      try {
        console.log('[Chat Fallback] Generating response using Gemini 1.5 Flash...');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: promptText
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          }
        );
        if (response.ok) {
          const data = await response.json();
          aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (aiResponseText) {
            modelUsed = "Gemini 1.5 Flash";
          }
        }
      } catch (err) {
        console.error("Gemini 1.5 Flash API call failed:", err);
      }
    }

    if (!aiResponseText && isOpenAIConfigured) {
      try {
        console.log('[Chat Fallback] Generating response using OpenAI GPT-4o-mini...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: promptText }],
            response_format: { type: "json_object" }
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiResponseText = data.choices?.[0]?.message?.content || "";
          if (aiResponseText) {
            modelUsed = "OpenAI GPT-4o-mini";
          }
        }
      } catch (err) {
        console.error("OpenAI API call failed (gpt-4o-mini):", err);
      }
    }

    if (!aiResponseText && isOpenAIConfigured) {
      try {
        console.log('[Chat Fallback] Generating response using OpenAI GPT-3.5-turbo...');
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: promptText }],
            response_format: { type: "json_object" }
          })
        });
        if (response.ok) {
          const data = await response.json();
          aiResponseText = data.choices?.[0]?.message?.content || "";
          if (aiResponseText) {
            modelUsed = "OpenAI GPT-3.5-turbo";
          }
        }
      } catch (err) {
        console.error("OpenAI API call failed (gpt-3.5-turbo):", err);
      }
    }

    // Parse AI output or execute rule-based fallback
    if (aiResponseText) {
      try {
        let jsonContent = aiResponseText.trim();
        const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/) || jsonContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
        const parsed = JSON.parse(jsonContent);
        if (parsed.reply) {
          reply = parsed.reply;
          actions = parsed.actions || [];
        }
      } catch (err) {
        console.error("JSON parsing of AI reply failed, using raw text:", err);
        reply = aiResponseText;
      }
    }

    // If no reply was generated, execute rule-based fallback
    if (!reply) {
      modelUsed = "Doot Local Rule-Based Engine";
      let fallbackReply = "";
      
      // Load contacts to find names/emails
      let contacts: any[] = [];
      try {
        const contactsPath = path.join(process.cwd(), "src/lib/data/contacts.json");
        if (fs.existsSync(contactsPath)) {
          contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf-8') || '[]');
        }
      } catch (e) {
        console.error("Error reading contacts in fallback:", e);
      }

      // Extract email to from query if possible
      let toEmail = "";
      let matchedContactName = "";
      // Search for any name from contacts in the query
      for (const contact of contacts) {
        const nameParts = contact.name.toLowerCase().split(' ');
        if (query.includes(contact.name.toLowerCase()) || (nameParts[0] && nameParts[0].length > 2 && query.includes(nameParts[0]))) {
          toEmail = contact.email;
          matchedContactName = contact.name;
          break;
        }
      }
      
      if (!toEmail) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const emailMatch = query.match(emailRegex);
        if (emailMatch) {
          toEmail = emailMatch[1];
        } else {
          toEmail = "recipient@example.com";
        }
      }

      // 1. Check if user is asking for email summary
      const hasComposeKeywords = query.includes("draft") || 
                                 query.includes("write") || 
                                 query.includes("send") || 
                                 query.includes("sent") ||
                                 query.includes("forward") || 
                                 query.includes("fowrda") ||
                                 query.includes("forword") ||
                                 query.includes("fowrd") ||
                                 query.includes("foward") ||
                                 query.includes("forwrd") ||
                                 query.includes("fwd") || 
                                 query.includes("reply") || 
                                 query.includes("compose") || 
                                 query.includes("bhej") || 
                                 query.includes("bhejo") ||
                                 query.includes("doctor") || 
                                 query.includes("docot") || 
                                 query.includes("appoint") || 
                                 query.includes("sick") || 
                                 query.includes("leave") ||
                                 query.includes("meeting") ||
                                 query.includes("schedule") ||
                                 query.includes("event") ||
                                 query.includes("add to calendar");

      const hasSummaryKeywords = query.includes("summary") || 
                                 query.includes("summarize") || 
                                 query.includes("summarise") || 
                                 query.includes("summar") || 
                                 query.includes("summer") || 
                                 query.includes("samary") || 
                                 query.includes("samri") || 
                                 query.includes("samre") || 
                                 query.includes("samariya") ||
                                 query.includes("unread") || 
                                 query.includes("latest") || 
                                 query.includes("inbox") ||
                                 query.includes("recent") ||
                                 query.includes("check mail") ||
                                 query.includes("check email") ||
                                 query.includes("show mail") ||
                                 query.includes("show email") ||
                                 query.includes("dikhao") ||
                                 query.includes("read mail") ||
                                 query.includes("read email");

      const hasEmailAddress = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/.test(query);
      const hasExplicitRecipient = hasEmailAddress || (toEmail && toEmail !== "recipient@example.com");

      const isSummaryRequest = !hasExplicitRecipient && (
                                 hasSummaryKeywords || 
                                 ((query.includes("emails") || query.includes("mail") || query.includes("inbox")) && !hasComposeKeywords)
                               );

      if (isSummaryRequest) {
        try {
          // Fetch any database emails first
          let dbEmails = await prisma.priorityEmail.findMany({
            where: {
              userId,
              category: { notIn: ['Sent', 'Drafts'] }
            },
            orderBy: { receivedAt: 'desc' },
            take: 10
          });

          const mockEmails = [
            {
              sender: 'Aarav Patel <aarav@doot.ai>',
              subject: '🌸 Urgent: Schedule review for Japanese Sketchbook Design System',
              summary: 'Aarav requests a meeting this Friday morning at 9:00 AM to review the Japanese Sketchbook Design System features, including paper styles and ring physics.',
              snippet: 'Hi there, we need to finalize the paper border styles and the spiral ring physics for the web view. Can we meet this Friday morning at 9:00 AM?'
            },
            {
              sender: 'Yuki Sato <yuki@tokyobento.com>',
              subject: '🍱 Bento Catering for the Hackathon Party',
              summary: 'Yuki confirms the order of 50 Kyoto-style lunch boxes to be delivered on Saturday at 12:00 PM for the hackathon.',
              snippet: 'Hello! Confirming your order for 50 Kyoto-style lunch boxes. We will deliver them directly to your workspace on Saturday at 12 PM.'
            },
            {
              sender: 'Sketchy Weekly <news@sketchy.dev>',
              subject: '🔥 Newsletter: 10 design tips for handwritten interfaces',
              summary: 'Weekly newsletter discussing 10 design tips for hand-drawn interfaces, highlighting SVG filters and border-radius properties.',
              snippet: 'In this week\'s issue: how to make web cards look hand-drawn using SVG filters and custom border-radius properties. Check it out!'
            }
          ] as any[];

          // Combine db and mock emails for search/display
          // Filter mocks that have identical subjects to db emails to avoid duplicates
          const filteredMocks = mockEmails.filter(
            (mock) => !dbEmails.some((dbE) => dbE.subject.toLowerCase().trim() === mock.subject.toLowerCase().trim())
          );
          const combinedEmails = [...dbEmails, ...filteredMocks];

          // Check if user is asking to summarize a specific email from the inbox list
          let targetEmailObj: any = null;
          let isSpecificEmail = false;

          for (const email of combinedEmails) {
            const emailSub = email.subject.toLowerCase();
            // Remove emojis to prevent match failures
            const cleanSub = emailSub.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim().toLowerCase();
            if (query.includes(cleanSub) || (cleanSub.length > 10 && query.includes(cleanSub.substring(0, 15)))) {
              targetEmailObj = email;
              isSpecificEmail = true;
              break;
            }
          }

          if (isSpecificEmail && targetEmailObj) {
            const emailSummary = targetEmailObj.summary || targetEmailObj.snippet || "No summary available.";
            fallbackReply = `🌸 **Email Summary:**\n\n- **From:** ${targetEmailObj.sender}\n- **Subject:** ${targetEmailObj.subject}\n\n**Summary:**\n${emailSummary}\n\nLet me know if you would like me to draft a reply or schedule a meeting for this! 🍱`;
          } else {
            // Otherwise give general inbox scroll summary
            // If the query specified a sender, filter the combined list
            let displayList = combinedEmails;
            let filteredBySender = false;
            for (const contact of contacts) {
              const nameParts = contact.name.toLowerCase().split(' ');
              if (query.includes(contact.name.toLowerCase()) || (nameParts[0] && nameParts[0].length > 2 && query.includes(nameParts[0]))) {
                displayList = combinedEmails.filter(e => e.sender.toLowerCase().includes(nameParts[0]));
                filteredBySender = true;
                break;
              }
            }

            // Fallback to top 5 if not filtered
            if (!filteredBySender) {
              displayList = combinedEmails.slice(0, 5);
            }

            if (displayList.length > 0) {
              fallbackReply = "🌸 **Inbox Scroll Summary:**\nHere is a summary of your latest email scrolls:\n\n";
              displayList.forEach((email: any, idx: number) => {
                const emailSummary = email.summary || email.snippet || "No summary available.";
                fallbackReply += `${idx + 1}. **From:** ${email.sender}\n   **Subject:** ${email.subject}\n   **Summary:** ${emailSummary}\n\n`;
              });
              fallbackReply += "Let me know if you want me to draft replies to any of these! 🍱";
            } else {
              fallbackReply = "🌸 Your inbox scrolls are currently clean and empty! No new messages to summarize. ⛩️";
            }
          }
        } catch (dbErr) {
          console.error("Failed to fetch inbox emails for summary:", dbErr);
          fallbackReply = "🌸 I tried to read your inbox scrolls, but had trouble accessing the database. Please try again! ⛩️";
        }
      } else {
        // 2. Otherwise run schedule or compose checks
        if (
          query.includes('schedule') || query.includes('meeting') || query.includes('calendar') || 
          query.includes('event') || query.includes('calande') || query.includes('clander') || 
          query.includes('calander') || query.includes('calender') || query.includes('metting') ||
          query.includes('add')
        ) {
          let title = "Meeting";
          const meetingAboutMatch = query.match(/(?:meeting|event|schedule|call|calande|clander|calander|calender|metting)(?:\s+about|\s+called|\s+for)?\s+([^,.\n?]+)/i);
          if (meetingAboutMatch && meetingAboutMatch[1] && meetingAboutMatch[1].trim().length > 2) {
            let extracted = meetingAboutMatch[1].trim();
            const stopWords = ["tomorrow", "today", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "morning", "afternoon", "evening", "at", "pm", "am", "with"];
            for (const sw of stopWords) {
              const regex = new RegExp(`\\b${sw}\\b.*`, 'i');
              extracted = extracted.replace(regex, '').trim();
            }
            if (extracted.length > 2) {
              title = `${extracted.charAt(0).toUpperCase() + extracted.slice(1)}`;
            }
          }
          title = `🌸 ${title}`;

          // Extract meeting link (URL) if present
          let meetingLink = "";
          const urlRegex = /(https?:\/\/[^\s]+)/gi;
          const urlMatch = message.match(urlRegex); // Search in original message to preserve case
          if (urlMatch) {
            meetingLink = urlMatch[0];
          }

          const targetDate = new Date(todayDate);
          let dateMatched = false;

          const monthRegexStr = '(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)';
          
          const patternA = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${monthRegexStr}\\b`, 'i');
          const patternB = new RegExp(`\\b${monthRegexStr}\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');

          const matchA = query.match(patternA);
          const matchB = query.match(patternB);

          let parsedDay = -1;
          let parsedMonthStr = "";

          if (matchA) {
            parsedDay = parseInt(matchA[1], 10);
            parsedMonthStr = matchA[2].toLowerCase();
            dateMatched = true;
          } else if (matchB) {
            parsedMonthStr = matchB[1].toLowerCase();
            parsedDay = parseInt(matchB[2], 10);
            dateMatched = true;
          }

          if (dateMatched) {
            const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
            let monthIdx = -1;
            for (let i = 0; i < 12; i++) {
              if (parsedMonthStr.startsWith(monthNames[i])) {
                monthIdx = i;
                break;
              }
            }

            if (monthIdx !== -1 && parsedDay >= 1 && parsedDay <= 31) {
              targetDate.setDate(1); // Safe reset to avoid month-end rollover
              targetDate.setMonth(monthIdx);
              targetDate.setDate(parsedDay);
              targetDate.setFullYear(todayDate.getFullYear());
              
              const todayCompare = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
              const targetCompare = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
              if (targetCompare < todayCompare) {
                targetDate.setFullYear(todayDate.getFullYear() + 1);
              }
            }
          }

          if (!dateMatched) {
            if (query.includes("today")) {
              targetDate.setTime(todayDate.getTime());
            } else if (query.includes("tomorrow")) {
              targetDate.setDate(todayDate.getDate() + 1);
            } else if (query.includes("monday")) {
              const currentDay = todayDate.getDay();
              const distance = (1 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("tuesday")) {
              const currentDay = todayDate.getDay();
              const distance = (2 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("wednesday")) {
              const currentDay = todayDate.getDay();
              const distance = (3 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("thursday")) {
              const currentDay = todayDate.getDay();
              const distance = (4 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("friday")) {
              const dayDiff = todayDate.getDay();
              const distance = (5 - dayDiff + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("saturday")) {
              const currentDay = todayDate.getDay();
              const distance = (6 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else if (query.includes("sunday")) {
              const currentDay = todayDate.getDay();
              const distance = (7 - currentDay + 7) % 7;
              targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
            } else {
              targetDate.setDate(todayDate.getDate() + 1);
            }
          }

          let startHour = 11;
          let startMin = 0;
          let ampm = "";

          // Try different time formats
          const timeMatch1 = query.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|baje)\b/i);
          const timeMatch2 = query.match(/(\d{1,2}):(\d{2})\b/);
          const timeMatch3 = query.match(/(?:at|around|ko|baje)\s*(\d{1,2})(?::(\d{2}))?\b/i);

          if (timeMatch1) {
            startHour = parseInt(timeMatch1[1], 10);
            startMin = timeMatch1[2] ? parseInt(timeMatch1[2], 10) : 0;
            ampm = timeMatch1[3].toLowerCase();
          } else if (timeMatch2) {
            startHour = parseInt(timeMatch2[1], 10);
            startMin = parseInt(timeMatch2[2], 10);
          } else if (timeMatch3) {
            startHour = parseInt(timeMatch3[1], 10);
            startMin = timeMatch3[2] ? parseInt(timeMatch3[2], 10) : 0;
          }

          if (ampm && ampm !== 'baje') {
            if (ampm === 'pm' && startHour < 12) startHour += 12;
            if (ampm === 'am' && startHour === 12) startHour = 0;
          } else {
            if (startHour >= 1 && startHour <= 7) startHour += 12;
          }

          const yr = targetDate.getFullYear();
          const mo = String(targetDate.getMonth() + 1).padStart(2, '0');
          const da = String(targetDate.getDate()).padStart(2, '0');
          const sh = String(startHour).padStart(2, '0');
          const sm = String(startMin).padStart(2, '0');
          const eh = String(Math.min(startHour + 1, 23)).padStart(2, '0');

          const start = `${yr}-${mo}-${da}T${sh}:${sm}:00`;
          const end = `${yr}-${mo}-${da}T${eh}:${sm}:00`;

          const dateStrFormatted = targetDate.toLocaleDateString("en-US", { weekday: 'long', month: "short", day: "numeric", year: "numeric" });
          const displayHour = startHour % 12 === 0 ? 12 : startHour % 12;
          const timeStrFormatted = `${displayHour}:${sm} ${startHour >= 12 ? 'PM' : 'AM'}`;

          // Extract location from query if present and not a meeting link
          let location = meetingLink || "";
          if (!location) {
            const locMatch = query.match(/(?:location is|location|in|at)\s+([^,.\n?]+)/i);
            if (locMatch && locMatch[1]) {
              let locCandidate = locMatch[1].trim();
              const timeStopWords = ["tomorrow", "today", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "at", "on", "in", "baje", "am", "pm"];
              for (const tsw of timeStopWords) {
                const regex = new RegExp(`\\b${tsw}\\b.*`, 'i');
                locCandidate = locCandidate.replace(regex, '').trim();
              }
              const isNumber = /^\d+$/.test(locCandidate);
              if (locCandidate && !isNumber && locCandidate.length > 2) {
                location = locCandidate.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              }
            }
          }
          if (!location) {
            location = "DootAI Main Lounge";
          }

          const description = meetingLink 
            ? `Scheduled via Doot AI Chatbot\n\nJoin Meeting: ${meetingLink}`
            : `Scheduled via Doot AI Chatbot at ${location}`;

          actions.push({
            type: "schedule_event",
            title,
            description,
            start,
            end,
            location
          });

          fallbackReply = `📅 **Meeting Scheduled!**\n- **Event:** ${title}\n- **Time:** ${dateStrFormatted} at ${timeStrFormatted}\n- **Location/Link:** ${location}\n\nI have added this to your sketchbook calendar! 🍱`;
        }

        if (
          query.includes('draft') || query.includes('email') || query.includes('mail') || 
          query.includes('send') || query.includes('sent') || query.includes('forward') || 
          query.includes('fowrda') || query.includes('forword') || query.includes('fowrd') || 
          query.includes('foward') || query.includes('forwrd') || query.includes('fwd') ||
          query.includes('appoint') || query.includes('docot') || query.includes('bhej') ||
          query.includes('bhejo') || hasEmailAddress
        ) {
          let emailSubject = "Discussion";
          let emailBody = "Hi,\n\nI am sending this email regarding our discussion.\n\nBest regards,\nHimanshu";
          
          const isForwardRequest = (query.includes("forward") || query.includes("fwd")) && 
                                   !query.includes("write") && 
                                   !query.includes("draft") && 
                                   !query.includes("mail") && 
                                   !query.includes("doctor") && 
                                   !query.includes("docot") && 
                                   !query.includes("appoint");

          let isUpdateRecipient = false;
          if (hasEmailAddress) {
            const hasNewTopicKeywords = query.includes("marriage") || query.includes("marrage") || 
                                        query.includes("wedding") || query.includes("invitation") || 
                                        query.includes("invite") || query.includes("celebration") ||
                                        query.includes("sick") || query.includes("leave") || 
                                        query.includes("fever") || query.includes("unwell") || 
                                        query.includes("ill") || query.includes("doctor") || 
                                        query.includes("docot") || query.includes("appoint") || 
                                        query.includes("hospital") || query.includes("project") || 
                                        query.includes("review") || query.includes("status") || 
                                        query.includes("update") || query.includes("slide") || 
                                        query.includes("report") || query.includes("thank") || 
                                        query.includes("appreciate") || query.includes("thanks");

            const hasForwardKeyword = query.includes("forward") || query.includes("fowrda") || 
                                      query.includes("forword") || query.includes("fowrd") || 
                                      query.includes("foward") || query.includes("forwrd") || 
                                      query.includes("fwd") || query.includes("send") || 
                                      query.includes("sent") || query.includes("bhej") || 
                                      query.includes("bhejo") || query.includes("share") || 
                                      query.includes("mail") || query.includes("email") ||
                                      query.includes("to") || query.includes("on") || query.includes("par");

            const hasContextPronoun = query.includes("this email") || query.includes("it") || 
                                      query.includes("that") || query.includes("this") || 
                                      query.includes("above") || query.includes("previous") || 
                                      query.includes("ye") || query.includes("isko") || 
                                      query.includes("isse");

            isUpdateRecipient = !hasNewTopicKeywords && (
              hasContextPronoun || 
              (hasForwardKeyword && query.length < 60)
            );
          }

          if (isForwardRequest && matches && matches.length > 0) {
            const firstMatch = matches[0];
            emailSubject = `Fwd: ${firstMatch.subject}`;
            emailBody = `Hi,\n\nI am forwarding this email to you:\n\n---------- Forwarded message ---------\nFrom: ${firstMatch.sender}\nSubject: ${firstMatch.subject}\nDate: ${firstMatch.receivedAt}\n\n${firstMatch.summary || ''}\n\nBest regards,\nHimanshu`;
          } else if (isUpdateRecipient) {
            try {
              const latestDraft = await prisma.priorityEmail.findFirst({
                where: { userId, category: 'Drafts' },
                orderBy: { receivedAt: 'desc' }
              });
              if (latestDraft) {
                const corsairEntity = await prisma.corsairEntity.findUnique({
                  where: { id: latestDraft.entityId }
                });
                if (corsairEntity) {
                  const emailData = corsairEntity.data as any;
                  emailSubject = emailData.subject || "Discussion";
                  emailBody = emailData.body || "";
                }
              }
            } catch (err) {
              console.error("Failed to retrieve latest draft for update recipient:", err);
            }
          } else {
            // Compose / Draft Request
            const parsed = generateFallbackEmail(query, toEmail);
            emailSubject = parsed.subject;
            emailBody = parsed.body;
          }

          actions.push({
            type: "send_email",
            to: toEmail,
            subject: emailSubject,
            body: emailBody
          });
          fallbackReply += (fallbackReply ? "\n\n" : "") + `📧 **Email Drafted!**\n- **To:** ${toEmail}\n- **Subject:** ${emailSubject}\n\n**Draft Content:**\n\`\`\`text\n${emailBody}\n\`\`\`\n\nI have prepared the email scroll for you. 🌸`;
        }

        if (!fallbackReply) {
          fallbackReply = `Hello! I am Doot, your personal mail assistant. Ask me to schedule a meeting, send or forward emails, and I will handle it all! 🌸`;
        }
      }

      reply = fallbackReply;
    }

    // Execute extracted actions
    for (const action of actions) {
      if (action.type === 'schedule_event') {
        try {
          // Write to PostgreSQL database
          await prisma.localEvent.create({
            data: {
              userId,
              title: action.title,
              description: action.description || '',
              start: action.start,
              end: action.end,
              location: action.location || 'Cozy Study Desk'
            }
          });

          // Create checklist task in DB
          await prisma.task.create({
            data: {
              userId,
              title: `Checklist for: ${action.title}`,
              priority: 'Medium',
              completed: false
            }
          });
        } catch (calErr) {
          console.error("Failed executing calendar action:", calErr);
        }
      }

      if (action.type === 'send_email') {
        try {
          const to = action.to || 'aarav@doot.ai';
          const subject = action.subject || 'Fwd: Email Scroll';
          const body = action.body || '';

          // Save as DRAFT instead of sending directly
          let gmailAccount = await prisma.corsairAccount.findFirst({
            where: {
              tenantId: userId,
              integration: { name: 'gmail' }
            }
          });

          if (!gmailAccount) {
            gmailAccount = await prisma.corsairAccount.findFirst({
              where: {
                integration: { name: 'gmail' }
              }
            });
          }

          const gmailConfig = (gmailAccount?.config || {}) as any;
          const accountId = gmailAccount?.id || 'mock-account-id';
          const entityId = `draft-${Date.now()}`;
          
          const corsairEntity = await prisma.corsairEntity.create({
            data: {
              id: `draft-entity-${Date.now()}`,
              accountId,
              entityId,
              entityType: 'messages',
              version: '1',
              data: {
                subject,
                from: gmailConfig.emailAddress || 'you@doot.ai',
                to,
                snippet: body.substring(0, 100),
                body,
                createdAt: new Date().toISOString(),
                category: 'Drafts'
              }
            }
          });

          await prisma.priorityEmail.create({
            data: {
              userId,
              entityId: corsairEntity.id,
              subject,
              sender: gmailConfig.emailAddress || 'you@doot.ai',
              snippet: body.substring(0, 100),
              priority: 'LOW',
              category: 'Drafts',
              summary: `Draft email regarding: ${subject}`,
              receivedAt: new Date()
            }
          });

          // Modify reply to prompt user for confirmation
          reply += "\n\nWould you like me to send this email? Reply with 'Yes' or 'Send' to confirm.";
        } catch (emailErr) {
          console.error("Failed executing email action:", emailErr);
        }
      }
    }

    if (modelUsed) {
      reply += `\n\n*(Powered by ${modelUsed})*`;
    }

    // Save messages in history
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
  } catch (error: unknown) {
    console.error('Error in AI Chat route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
