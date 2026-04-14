import { ThemeProvider } from '@/components/theme-provider'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppShell } from '@/components/app-shell'
import type { User } from '@supabase/supabase-js'

export interface RouterContext {
    auth: User | null
}

const RootLayout = () => (
    <>
        <ThemeProvider>
            <AppShell />
        </ThemeProvider>
        {import.meta.env.MODE === 'development1' && <TanStackRouterDevtools position="bottom-right" />}
    </>
)

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
})