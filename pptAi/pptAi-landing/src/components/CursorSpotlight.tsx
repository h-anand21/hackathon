import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'

export default function CursorSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.04), transparent 80%)`

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
      style={{ background }}
    />
  )
}
