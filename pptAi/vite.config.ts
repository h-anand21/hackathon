import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config = defineConfig({
  plugins: [
    tsconfigPaths(),
    devtools(), 
    tailwindcss(), 
    tanstackStart(),
    netlify(),
    viteReact()
  ],
  optimizeDeps: {
    include: [
      'defu',
      'nanostores',
      'better-auth',
      'better-auth/react',
      '@better-fetch/fetch',
      'inngest',
      'ai',
      '@ai-sdk/openai',
      'sonner',
      'lucide-react',
    ],
  },
  ssr: {
    noExternal: ['pptxgenjs'],
  },
})

export default config
