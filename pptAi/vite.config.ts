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
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  optimizeDeps: {
    entries: ['src/routes/**/*.{ts,tsx}'],
    holdUntilCrawlEnd: true,
    exclude: [
      '@tanstack/react-router',
      '@tanstack/react-start',
      '@tanstack/router-core',
      '@tanstack/react-cross-context',
    ],
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'defu',
      'nanostores',
      'better-auth',
      'better-auth/react',
      '@better-fetch/fetch',
      'inngest',
      'ai',
      '@ai-sdk/react',
      '@ai-sdk/openai',
      'sonner',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'swiper',
      'swiper/react',
      'swiper/modules',
      'zod',
    ],
  },
  ssr: {
    // child_process, fs, os are Node-only — keep them out of the client bundle
    external: ['child_process', 'fs', 'os', 'path'],
  },
})

export default config
