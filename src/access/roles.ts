//src\access\roles.ts
import type { Access, FieldAccess } from 'payload'

export const admin: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}
/* 
Full system authority: create, read, update, delete across all collections 
and manage roles/settings.
*/

export const owner: Access = ({ req: { user } }) => {
  return Boolean(user && ['admin', 'owner'].includes(user.role))
}
/* 
Full business control: read all content and manage operational collections, 
but no system or role-level control.
*/

export const editor: Access = ({ req: { user } }) => {
  return Boolean(user && ['admin', 'owner', 'editor'].includes(user.role))
}
/* 
Manager-level access: read assigned collections and create/update/delete 
within their scope, no user or system management.
*/

export const member: Access = ({ req: { user } }) => {
  return Boolean(user && ['admin', 'owner', 'editor', 'member'].includes(user.role))
}
/* 
Staff-level access: read assigned content and create/update their own entries, 
with limited or no delete/publish rights.
*/

// NEW: customers only
export const customer: Access = ({ req: { user } }) => user?.role === 'customer'

// NEW: document owner OR staff (admin/owner/editor)
// Use on collections where the logged-in user should only see/edit their own rows.
// `ownerField` is the name of the relationship field pointing at Users (default: 'user')
export const selfOrStaff =
  (ownerField = 'user'): Access =>
  ({ req: { user }, id }) => {
    if (!user) return false
    // Staff can always access
    if (['admin', 'owner', 'editor'].includes(user.role)) return true
    // Customers can only access their own document
    return { [ownerField]: { equals: user.id } }
  }

// ── Field-level variants ────────────────────────────────────────────────────
// FieldAccess receives FieldAccessArgs, which has id: string | number | undefined
// rather than the collection-level id: number | undefined — a different type.

export const adminFieldAccess: FieldAccess = ({ req: { user } }) =>
  user?.role === 'admin'

export const readOnlyForNonAdmin: FieldAccess = ({ req: { user } }) =>
  user?.role === 'admin'