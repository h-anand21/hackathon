import { prisma } from './db';

const rawKey = process.env.GEMINI_API_KEY || '';
const GEMINI_API_KEY = rawKey.replace(/['"]/g, '').trim();

const rawOpenAIKey = process.env.OPENAI_API_KEY || '';
const OPENAI_API_KEY = rawOpenAIKey.replace(/['"]/g, '').trim();

export interface ClassifiedEmail {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  summary: string;
}

/**
 * Calls Gemini API to classify the email content, with a fallback to OpenAI (gpt-4o-mini).
 */
export async function classifyAndSummarizeEmail(
  subject: string,
  sender: string,
  body: string
): Promise<ClassifiedEmail> {
  const isGeminiConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key' && GEMINI_API_KEY !== '';
  const isOpenAIConfigured = OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key' && OPENAI_API_KEY !== '';

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

  // 1. Try Gemini
  if (isGeminiConfigured) {
    try {
      console.log('[AI] Classifying email using Gemini...');
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

      if (response.ok) {
        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        return {
          priority: parsed.priority || 'MEDIUM',
          category: parsed.category || 'Personal',
          summary: parsed.summary || 'No summary available.'
        };
      } else {
        console.warn(`[AI Warning] Gemini classification failed (Status: ${response.status}). Trying OpenAI fallback...`);
      }
    } catch (error) {
      console.error('[AI Error] Gemini classification threw error:', error);
    }
  }

  // 2. Try OpenAI Fallback
  if (isOpenAIConfigured) {
    try {
      console.log('[AI Fallback] Classifying email using OpenAI (gpt-4o-mini)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = (data.choices?.[0]?.message?.content || '').trim();
        const parsed = JSON.parse(text);
        return {
          priority: parsed.priority || 'MEDIUM',
          category: parsed.category || 'Personal',
          summary: parsed.summary || 'No summary available.'
        };
      } else {
        console.warn(`[AI Warning] OpenAI classification failed (Status: ${response.status}).`);
      }
    } catch (error) {
      console.error('[AI Error] OpenAI classification threw error:', error);
    }
  }

  // 3. Absolute Fallback
  console.warn('[AI Warning] Both Gemini and OpenAI failed or are not configured. Returning mock details.');
  return {
    priority: 'MEDIUM',
    category: 'Personal',
    summary: `Email from ${sender} with subject "${subject}".`
  };
}

/**
 * Generates a 768-dimensional embedding vector, trying Gemini first and falling back to OpenAI (text-embedding-3-small).
 */
export async function getGeminiEmbedding(text: string): Promise<number[]> {
  const isGeminiConfigured = GEMINI_API_KEY && GEMINI_API_KEY !== 'your-gemini-api-key' && GEMINI_API_KEY !== '';
  const isOpenAIConfigured = OPENAI_API_KEY && OPENAI_API_KEY !== 'your-openai-api-key' && OPENAI_API_KEY !== '';

  // 1. Try Gemini
  if (isGeminiConfigured) {
    try {
      console.log('[AI] Generating embedding using Gemini (text-embedding-004)...');
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

      if (response.ok) {
        const data = await response.json();
        if (data.embedding?.values) {
          return data.embedding.values;
        }
      }
      console.warn(`[AI Warning] Gemini embedding failed (Status: ${response.status}). Trying OpenAI fallback...`);
    } catch (error) {
      console.error('[AI Error] Gemini embedding threw error:', error);
    }
  }

  // 2. Try OpenAI Fallback (text-embedding-3-small, 768 dimensions)
  if (isOpenAIConfigured) {
    try {
      console.log('[AI Fallback] Generating embedding using OpenAI (text-embedding-3-small)...');
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          dimensions: 768
        })
      });

      if (response.ok) {
        const data = await response.json();
        const vector = data.data?.[0]?.embedding;
        if (vector && vector.length === 768) {
          return vector;
        }
      }
      console.warn(`[AI Warning] OpenAI embedding failed (Status: ${response.status}).`);
    } catch (error) {
      console.error('[AI Error] OpenAI embedding threw error:', error);
    }
  }

  // 3. Absolute Fallback
  console.warn('[AI Warning] Both Gemini and OpenAI embedding generation failed or are not configured. Returning random vector.');
  return new Array(768).fill(0).map(() => Math.random());
}

/**
 * Saves or updates an email's embedding in the database using raw SQL for pgvector support.
 */
export async function saveEmailEmbedding(entityId: string, content: string, embedding: number[]) {
  try {
    const id = 'emb_' + Math.random().toString(36).substring(2, 15);
    const embeddingString = `[${embedding.join(',')}]`;

    // We use a raw SQL query with cast because Prisma doesn't natively support Unsupported("vector") inserts easily.
    // Using $executeRawUnsafe avoids serialization bugs in the Prisma query engine with custom PG extension types.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "EmailEmbedding" ("id", "entity_id", "content", "embedding")
       VALUES ($1, $2, $3, cast($4 as vector))
       ON CONFLICT ("entity_id") DO UPDATE
       SET "content" = $3, "embedding" = cast($4 as vector)`,
      id,
      entityId,
      content,
      embeddingString
    );
    console.log(`Saved embedding for entity ${entityId} to both databases successfully.`);
  } catch (error) {
    console.error('Failed to save email embedding:', error);
  }
}
