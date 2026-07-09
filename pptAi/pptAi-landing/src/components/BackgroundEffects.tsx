'use client'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary glow blob - top left */}
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
      />
      {/* Cyan blob - top right */}
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)' }}
      />
      {/* Violet blob - bottom center */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
