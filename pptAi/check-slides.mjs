import pkg from '@prisma/client'
const { PrismaClient } = pkg
const p = new PrismaClient()
const slides = await p.slide.findMany({
  where: { presentationId: 'cmrggni4v0000soidjea2i1xd' },
  select: { order: true, title: true, imageUrl: true },
  orderBy: { order: 'asc' },
})
console.log(JSON.stringify(slides, null, 2))
await p.$disconnect()
