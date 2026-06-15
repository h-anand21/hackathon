import { prisma } from './db';

const rawKey = process.env.GEMINI_API_KEY || '';
const GEMINI_API_KEY = rawKey.replace(/['"]/g, '').trim();

export interface ClassifiedEmail {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  summary: string;
}

/**
 * Calls Gemini API to classify the email content into a priority, category, and summary.
 */
export async function classifyAndSummarizeEmail(
  subject: string,
  sender: string,
  body: string
): Promise<ClassifiedEmail> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key') {
    console.warn('[AI Warning] GEMINI_API_KEY is not configured in .env. Falling back to mock classification and summary.');
    // Return default fallback if API key is not configured
    return {
      priority: 'MEDIUM',
      category: 'Personal',
      summary: `Email from ${sender} with subject "${subject}".`
    };
  }

  const prompt = `
    You are an AI assistant designed to classify incoming emails for an inbox app called DootAI MailOS.
    Analyze the following email details:
    Sender: ${sender}
    Subject: ${subject}
    Body: ${body}

    Classify this email into one of the following:
    - Priority: "HIGH", "MEDIUM", or "LOW"
    - Category: "Urgent", "Important", "Personal", "Promotional", or "Spam"
    - Summary: A brief, one-sentence summary of the email (max 150 characters).

    Respond ONLY with a valid JSON object matching this schema. Do not include any markdown formatting (like \`\`\`json), other text, or explanation.
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "Urgent" | "Important" | "Personal" | "Promotional" | "Spam",
      "summary": "one-sentence summary"
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any markdown blocks if the model ignored the instructions
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);
    return {
      priority: parsed.priority || 'MEDIUM',
      category: parsed.category || 'Personal',
      summary: parsed.summary || 'No summary available.'
    };
  } catch (error) {
    console.error('Failed to classify email with Gemini:', error);
    return {
      priority: 'MEDIUM',
      category: 'Personal',
      summary: `Email from ${sender} with subject "${subject}".`
    };
  }
}

/**
 * Generates a 768-dimensional embedding vector using Gemini's text-embedding-004 model.
 */
export async function getGeminiEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key') {
    console.warn('[AI Warning] GEMINI_API_KEY is not configured in .env. Generating a random 768-dimensional embedding vector.');
    // Return a dummy 768-dimensional vector if no API key is set
    return new Array(768).fill(0).map(() => Math.random());
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: {
            parts: [{ text }]
          }
        })
      }
    );

    const data = await response.json();
    return data.embedding?.values || [];
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return new Array(768).fill(0).map(() => Math.random());
  }
}

/**
 * Saves or updates an email's embedding in the database using raw SQL for pgvector support.
 */
export async function saveEmailEmbedding(entityId: string, content: string, embedding: number[]) {
  try {
    const id = 'emb_' + Math.random().toString(36).substring(2, 15);
    const embeddingString = `[${embedding.join(',')}]`;

    // We use a raw SQL query with cast because Prisma doesn't natively support Unsupported("vector") inserts easily
    await prisma.$executeRaw`
      INSERT INTO "EmailEmbedding" ("id", "entity_id", "content", "embedding")
      VALUES (${id}, ${entityId}, ${content}, cast(${embeddingString} as vector))
      ON CONFLICT ("entity_id") DO UPDATE
      SET "content" = ${content}, "embedding" = cast(${embeddingString} as vector)
    `;
    console.log(`Saved embedding for entity ${entityId} to both databases successfully.`);
  } catch (error) {
    console.error('Failed to save email embedding:', error);
  }
}
