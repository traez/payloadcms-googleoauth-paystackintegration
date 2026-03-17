//src\hooks\users\slugifyDisplayName.ts
import type { CollectionBeforeValidateHook } from 'payload'

const slugify = (s: string) => {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const slugifyDisplayName: CollectionBeforeValidateHook = async ({ data = {} }) => {
  if (data.displayName) {
    if (data.displayName.firstName) {
      data.displayName.firstName = slugify(data.displayName.firstName)
    }

    if (data.displayName.lastName) {
      data.displayName.lastName = slugify(data.displayName.lastName)
    }
  }

  return data
}