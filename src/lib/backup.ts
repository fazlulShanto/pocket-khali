import { db } from "./db"

export const exportDatabase = async () => {
    try {
        const data: Record<string, any[]> = {}
        const tables = db.tables

        for (const table of tables) {
            data[table.name] = await table.toArray()
        }

        const backupData = {
            version: db.verno,
            timestamp: new Date().toISOString(),
            data
        }

        const jsonString = JSON.stringify(backupData, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `pocket-khali-db-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return true
    } catch (e) {
        console.error("Failed to export db:", e)
        return false
    }
}

export const importDatabase = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                if (!e.target?.result) throw new Error("File empty")
                
                const backup = JSON.parse(e.target.result as string)
                if (!backup.data) throw new Error("Invalid format")

                // Clear current data and load new inside a transaction
                await db.transaction('rw', db.tables, async () => {
                    for (const table of db.tables) {
                        if (backup.data[table.name]) {
                            await table.clear()
                            await table.bulkAdd(backup.data[table.name])
                        }
                    }
                })
                
                resolve(true)
            } catch (err) {
                console.error("Import error:", err)
                resolve(false)
            }
        }
        reader.onerror = () => resolve(false)
        reader.readAsText(file)
    })
}

export const clearDatabase = async () => {
    return db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
            await table.clear()
        }
    })
}
