import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'

import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

import { ThemeProvider } from './components/ThemeProvider'

import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ThemeProvider attribute="class" defaultTheme="light" storageKey="pollsphere-theme">
        <RouterProvider router={router} />
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
