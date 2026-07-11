// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CursorGlow() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 80, damping: 20 })
  const springY = useSpring(y, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-10"
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
    >
      <div
        className="w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  )
}
