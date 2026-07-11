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
            system: `You are an AI Copilot for a presentation editor. 
The user is currently editing a presentation. You have the context of their current slides.
Help them rewrite, improve, brainstorm content, or structure their presentation better.
Keep your responses very concise and action-oriented. Do not use overly formal language.

CURRENT PRESENTATION SLIDES:
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
