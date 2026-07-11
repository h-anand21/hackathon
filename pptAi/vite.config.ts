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
  ssr: {
    noExternal: ['pptxgenjs'],
  },
})

export default config
