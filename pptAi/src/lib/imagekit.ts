import fs from 'fs/promises'
import path from 'path'

export async function uploadImageFromUrl(
  url: string,
  fileName: string,
  folder = 'slides',
): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    
    const safeName = `${fileName}-${Date.now()}.png`
    const filePath = path.join(uploadsDir, safeName)
    await fs.writeFile(filePath, buffer)
    
    return `/uploads/${safeName}`
  } catch (err) {
    console.error('Failed to save image locally:', err)
    return ''
  }
}
