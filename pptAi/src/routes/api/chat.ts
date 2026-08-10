import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const mesh = createOpenAI({
  baseURL: 'https://api.meshapi.ai/v1',
  apiKey: process.env.MESH_API_KEY,
})

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const body = await request.json()
          console.log("Chat API received body:", body)
          const { messages, context } = body

          const result = await streamText({
            model: mesh.chat('google/gemini-3.5-flash'),
            system: `You are an elite AI Presentation Copilot for PPT.ai.
The user is currently editing a presentation. You have the full context of their slides and the active slide they are working on.

Your goal is to help them rewrite, polish, structure, brainstorm, and create world-class slides.

Key formatting rule:
Whenever you propose a rewrite or new content for a slide, format it in a clean markdown block like this:
\`\`\`slide-proposal
Title: [Punchy Title]
Content:
• [High-impact point 1]
• [High-impact point 2]
• [High-impact point 3]
\`\`\`

If proposing a KPI Stat Card, format as:
\`\`\`slide-proposal
Title: [KPI Title]
Content:
[Big Metric 1] : [Description 1]
[Big Metric 2] : [Description 2]
[Big Metric 3] : [Description 3]
\`\`\`

Keep all other explanations concise, sharp, and action-oriented.

CURRENT PRESENTATION SLIDES & CONTEXT:
${context}`,
            messages,
          })

          return (result as any).toDataStreamResponse 
            ? (result as any).toDataStreamResponse()
            : (result as any).toUIMessageStreamResponse()
        } catch (e) {
          console.error('Chat API Error details:', e)
          return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
        }
      },
    },
  },
})
