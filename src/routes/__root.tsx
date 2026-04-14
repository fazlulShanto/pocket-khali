import { ThemeProvider } from '@/components/theme-provider'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => (

    <>
        <ThemeProvider>
            <Outlet />
        </ThemeProvider>
        <TanStackRouterDevtools />
    </>
)

export const Route = createRootRoute({ component: RootLayout })