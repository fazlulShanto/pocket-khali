import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/pages/settings' // Will be created in phase 9

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
