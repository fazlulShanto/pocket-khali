
import "./index.css"
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { seedDatabase } from './lib/seed'
import { supabase } from './lib/supabase'

// Create a new router instance with auth context
const router = createRouter({
  routeTree,
  context: {
    auth: null, // Will be populated after session check
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Seed the database with default categories and settings
seedDatabase()

// Initialize auth state before rendering  
async function start() {
  // Get initial session from Supabase (reads from localStorage)
  const { data } = await supabase.auth.getSession()
  const initialUser = data.session?.user ?? null

  // Listen to auth changes and invalidate router so context updates
  supabase.auth.onAuthStateChange((_event, session) => {
    router.invalidate()
    // Update context directly
    router.update({
      context: { auth: session?.user ?? null },
    })
  })

  // Render the app with the initial auth context
  const rootElement = document.getElementById('root')!
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <RouterProvider
          router={router}
          context={{ auth: initialUser }}
        />
      </StrictMode>,
    )
  }
}

start()