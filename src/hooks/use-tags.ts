import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Tag } from "../lib/types"

export function useTags() {
  const tags = useLiveQuery(() => db.tags.orderBy("name").toArray())

  const addTag = async (tag: Omit<Tag, "id">) => {
    // Check if tag with this name already exists
    const existing = await db.tags.where("name").equals(tag.name).first()
    if (existing) {
      throw new Error(`Tag with name ${tag.name} already exists.`)
    }
    return db.tags.add(tag)
  }

  const updateTag = async (id: number, changes: Partial<Tag>) => {
    return db.tags.update(id, changes)
  }

  const deleteTag = async (id: number) => {
    return db.tags.delete(id)
  }

  return { tags, addTag, updateTag, deleteTag }
}
