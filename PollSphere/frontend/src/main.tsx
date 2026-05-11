import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <h1 className="text-3xl font-bold p-8">PollSphere Phase 2 Active</h1>
        {/* We will insert TanStack Router here in the next phase */}
      </div>
    </ClerkProvider>
  </React.StrictMode>,
)
