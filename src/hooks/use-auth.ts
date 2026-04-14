import * as React from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setState({
        user: data.session?.user ?? null,
        session: data.session,
        loading: false,
      })
    })

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
