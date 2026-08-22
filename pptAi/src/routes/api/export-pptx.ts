import { createFileRoute } from '@tanstack/react-router'
import { auth } from '#/lib/auth'
import { prisma } from '#/db'
import { exportToPptx } from '#/features/presentations/lib/export-pptx'

export const Route = createFileRoute('/api/export-pptx')(({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        // Auth check
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        let presentationId: string
        let theme: string
        try {
          const body = await request.json()
          presentationId = body.presentationId
          theme = body.theme ?? 'obsidian-neon'
          if (!presentationId) throw new Error('missing presentationId')
        } catch {
          return new Response(JSON.stringify({ error: 'Bad request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Fetch presentation + slides
        const presentation = await prisma.presentation.findFirst({
          where: { id: presentationId, userId: session.user.id },
          include: { slides: { orderBy: { order: 'asc' } } },
        })
        if (!presentation) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Generate .pptx via OfficeCLI
        let pptxBuffer: Buffer
        try {
          pptxBuffer = await exportToPptx({
            title: presentation.title,
            slides: presentation.slides,
            theme,
          })
        } catch (err) {
          console.error('OfficeCLI export failed:', err)
          return new Response(JSON.stringify({ error: 'Export failed', detail: String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const safeFilename = presentation.title
          .replace(/[^a-zA-Z0-9_\- ]/g, '_')
          .replace(/\s+/g, '_')
          .slice(0, 60)

        return new Response(new Uint8Array(pptxBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${safeFilename}.pptx"`,
            'Content-Length': String(pptxBuffer.length),
          },
        })
      },
    },
  },
}))
