import { ThemeProvider } from '@/components/theme-provider'
import { createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AppShell } from '@/components/app-shell'

const RootLayout = () => (
    <>
        <ThemeProvider>
            <AppShell />
        </ThemeProvider>
        {import.meta.env.MODE === 'development1' && <TanStackRouterDevtools position="bottom-right" />}
    </>
)

export const Route = createRootRoute({ component: RootLayout })