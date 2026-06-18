import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
    }

    const query = message.toLowerCase();
    let reply = "";
    let actions: any[] = [];

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
        console.log('[Chat] Generating response using Gemini...');
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
        }
      } catch (err) {
        console.error("Gemini API call failed, trying OpenAI fallback:", err);
      }
    }

    if (!aiResponseText && isOpenAIConfigured) {
      try {
        console.log('[Chat Fallback] Generating response using OpenAI...');
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
        }
      } catch (err) {
        console.error("OpenAI API call failed:", err);
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

      if (query.includes('schedule') || query.includes('meeting') || query.includes('calendar') || query.includes('event')) {
        let title = "Meeting";
        const meetingAboutMatch = query.match(/(?:meeting|event|schedule|call)(?:\s+about|\s+called|\s+for)?\s+([^,.\n?]+)/);
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

        const targetDate = new Date();
        targetDate.setDate(todayDate.getDate() + 1); // Default to tomorrow
        
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
          const currentDay = todayDate.getDay();
          const distance = (5 - currentDay + 7) % 7;
          targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
        } else if (query.includes("saturday")) {
          const currentDay = todayDate.getDay();
          const distance = (6 - currentDay + 7) % 7;
          targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
        } else if (query.includes("sunday")) {
          const currentDay = todayDate.getDay();
          const distance = (7 - currentDay + 7) % 7;
          targetDate.setDate(todayDate.getDate() + (distance === 0 ? 7 : distance));
        }

        let startHour = 11;
        let startMin = 0;
        const timeMatch = query.match(/(?:at|around)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
        if (timeMatch) {
          let hr = parseInt(timeMatch[1]);
          const min = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const ampm = timeMatch[3];
          if (ampm) {
            if (ampm.toLowerCase() === 'pm' && hr < 12) hr += 12;
            if (ampm.toLowerCase() === 'am' && hr === 12) hr = 0;
          } else {
            if (hr >= 1 && hr <= 7) hr += 12;
          }
          startHour = hr;
          startMin = min;
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
        const timeStrFormatted = `${startHour}:${sm} ${startHour >= 12 ? 'PM' : 'AM'}`;

        actions.push({
          type: "schedule_event",
          title,
          description: "Scheduled via Doot AI Chatbot",
          start,
          end,
          location: "DootAI Main Lounge"
        });
        fallbackReply = `📅 **Meeting Scheduled!**\n- **Event:** ${title}\n- **Time:** ${dateStrFormatted} at ${timeStrFormatted}\n- **Location:** DootAI Main Lounge\n\nI have added this to your sketchbook calendar! 🍱`;
      }

      if (query.includes('draft') || query.includes('email') || query.includes('send') || query.includes('forward')) {
        let emailSubject = "Discussion";
        let emailBody = "Hi,\n\nI am sending this email regarding our discussion.\n\nBest regards,\nHimanshu";
        
        if (matches && matches.length > 0) {
          const firstMatch = matches[0];
          emailSubject = `Fwd: ${firstMatch.subject}`;
          emailBody = `Hi,\n\nI am forwarding this email to you:\n\n---------- Forwarded message ---------\nFrom: ${firstMatch.sender}\nSubject: ${firstMatch.subject}\nDate: ${firstMatch.receivedAt}\n\n${firstMatch.summary || ''}\n\nBest regards,\nHimanshu`;
        }

        actions.push({
          type: "send_email",
          to: toEmail,
          subject: emailSubject,
          body: emailBody
        });
        fallbackReply += (fallbackReply ? "\n\n" : "") + `📧 **Email Drafted!**\n- **To:** ${toEmail}\n- **Subject:** ${emailSubject}\n\nI have prepared the email scroll for you. 🌸`;
      }

      if (!fallbackReply) {
        fallbackReply = `Hello! I am Doot, your personal mail assistant. Ask me to schedule a meeting, send or forward emails, and I will handle it all! 🌸`;
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

          // Attempt Corsair send
          try {
            const gmailAccount = await prisma.corsairAccount.findFirst({
              where: {
                tenantId: userId,
                integration: { name: 'gmail' }
              }
            });

            if (gmailAccount) {
              const tenant = corsair.withTenant(userId);
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
            console.warn("Could not send real Gmail, logging mock instead:", gmailErr);
          }

          // Save sent email into CorsairEntity and PriorityEmail so it displays in the "Sent" tab
          const gmailAccount = await prisma.corsairAccount.findFirst({
            where: {
              tenantId: userId,
              integration: { name: 'gmail' }
            }
          });

          const gmailConfig = (gmailAccount?.config || {}) as any;
          const accountId = gmailAccount?.id || 'mock-account-id';
          const entityId = `sent-${Date.now()}`;
          
          const corsairEntity = await prisma.corsairEntity.create({
            data: {
              id: `sent-entity-${Date.now()}`,
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
                category: 'Sent'
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
              category: 'Sent',
              summary: `Sent email regarding: ${subject}`,
              receivedAt: new Date()
            }
          });
        } catch (emailErr) {
          console.error("Failed executing email action:", emailErr);
        }
      }
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
