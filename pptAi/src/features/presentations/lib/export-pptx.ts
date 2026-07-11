import pptxgen from 'pptxgenjs'

type Slide = {
  id: string
  order: number
  title: string
  content: string
  notes?: string | null
  imageUrl?: string | null
}

type ExportOptions = {
  title: string
  slides: Slide[]
}

export async function exportToPptx({ title, slides }: ExportOptions) {
  const pptx = new pptxgen()

  pptx.author = 'PPT AI'
  pptx.title = title
  pptx.subject = 'AI Generated Presentation'
  pptx.layout = 'LAYOUT_16x9'

  // Define Master Slide
  pptx.defineSlideMaster({
    title: "PREMIUM_DARK",
    background: { color: "090B10" },
    objects: [
      // Top accent bar
      { rect: { x: 0, y: 0, w: "100%", h: 0.08, fill: { color: "FF8A2A" } } },
      // Footer text
      { text: { text: title, options: { x: 0.5, y: 7.2, w: 5, h: 0.2, fontSize: 10, color: "555566", fontFace: "Helvetica" } } }
    ]
  });

  for (const slideData of slides) {
    const slide = pptx.addSlide({ masterName: "PREMIUM_DARK" })

    if (slideData.imageUrl) {
      try {
        slide.addImage({
          path: slideData.imageUrl,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
          sizing: { type: 'cover', w: '100%', h: '100%' },
        })

        slide.addShape('rect' as pptxgen.ShapeType, {
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
          fill: { color: '090B10', transparency: 65 },
        })
      } catch {
        // Master slide background will be used
      }
    }

    slide.addText(slideData.title, {
      x: 0.6,
      y: 0.6,
      w: 8.8,
      h: 1.2,
      fontSize: 40,
      fontFace: 'Helvetica',
      color: 'FFFFFF',
      bold: true,
      valign: 'middle',
    })
    
    // Orange accent line under title
    slide.addShape('rect' as pptxgen.ShapeType, {
      x: 0.6,
      y: 1.9,
      w: 1.2,
      h: 0.06,
      fill: { color: 'FF8A2A' }
    });

    const contentLines = slideData.content.split('\n').filter(Boolean)
    const formattedContent = contentLines.map((line) => ({
      text: line.startsWith('•') ? line.replace('•', '').trim() : line,
      options: {
        fontSize: 18,
        color: 'E2E8F0',
        bullet: true,
        breakLine: true,
      },
    }))

    slide.addText(formattedContent, {
      x: 0.6,
      y: 2.3,
      w: 8.8,
      h: 4.8,
      fontFace: 'Helvetica',
      valign: 'top',
      paraSpaceAfter: 16,
      lineSpacing: 28
    })

    if (slideData.notes) {
      slide.addNotes(slideData.notes)
    }
  }

  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
  await pptx.writeFile({ fileName: filename })

  return filename
}
