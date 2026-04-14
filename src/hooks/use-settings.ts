import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"

export function useSettings() {
  const settingsArray = useLiveQuery(() => db.settings.toArray())

  const settings = settingsArray?.reduce((acc, current) => {
    acc[current.key] = current.value
    return acc
  }, {} as Record<string, any>) || {}

  const setSetting = async (key: string, value: any) => {
    return db.settings.put({ key, value })
  }

  return { settings, setSetting }
}
