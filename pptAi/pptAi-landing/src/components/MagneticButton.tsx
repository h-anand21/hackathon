import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef } from 'react'
import type { ReactNode } from 'react'

export default function MagneticButton({ 
  children, 
  className, 
  href, 
  onClick 
}: { 
  children: ReactNode, 
  className?: string, 
  href?: string,
  onClick?: () => void
}) {
  const ref = useRef<any>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.3)
    y.set((e.clientY - centerY) * 0.3)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const props = {
    ref,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    style: { x: springX, y: springY },
    className,
    onClick
  }

  if (href) {
    return <motion.a href={href} {...props}>{children}</motion.a>
  }
  return <motion.button type="button" {...props}>{children}</motion.button>
}
