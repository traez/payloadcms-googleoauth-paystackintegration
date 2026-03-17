// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { admin, selfOrStaff, adminFieldAccess } from '@/access/roles'
import { slugifyDisplayName } from '@/hooks/users/slugifyDisplayName'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'displayName.firstName', 'displayName.lastName', 'updatedAt'],
  },
  auth: true,
  // src/collections/Users.ts  (access block only — rest stays the same)
  access: {
    read: selfOrStaff(), // customers see themselves; staff see all
    create: admin, // only admins create users manually
    update: selfOrStaff(), // customers update themselves; staff update anyone
    delete: admin, // admins only
    admin: (
      { req: { user } }, // who can enter /admin
    ) => Boolean(user && ['admin', 'owner', 'editor', 'member'].includes(user.role)),
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
        { label: 'Member', value: 'member' },
        { label: 'Customer', value: 'customer' }, // ← NEW: Google-authenticated customers
      ],
      required: true,
      defaultValue: 'member',
      access: {
        update: adminFieldAccess, // only admins can change roles
      },
    },
    {
      name: 'displayName',
      type: 'group',
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: false, // ← relaxed: customers may not have this initially
          admin: {
            description: 'Only letters, numbers, and hyphens allowed. Will be saved as lowercase.',
          },
        },
        {
          name: 'lastName',
          type: 'text',
          required: false, // ← relaxed for the same reason
          admin: {
            description: 'Only letters, numbers, and hyphens allowed. Will be saved as lowercase.',
          },
        },
      ],
    },

    // ── Google OAuth identity anchor ─────────────────────────────────────────
    {
      name: 'providerUserId',
      type: 'text',
      access: {
        update: adminFieldAccess, // never writable by the user themselves
      },
      unique: true, // one Google account → one Users document
      index: true, // fast lookup in googleStrategy
      admin: {
        readOnly: true,
        description: "Google's permanent 'sub' value. Set once, never changed.",
        condition: (data) => data.role === 'customer',
      },
    },

    // ── Per-provider token metadata ──────────────────────────────────────────
    {
      name: 'externalId',
      type: 'group',
      admin: {
        description: 'OAuth provider metadata. Managed automatically — do not edit manually.',
        condition: (data) => data.role === 'customer',
      },
      fields: [
        {
          name: 'authStrategies',
          type: 'array',
          admin: {
            description: 'One entry per OAuth provider this account has authenticated with.',
          },
          fields: [
            {
              name: 'provider',
              type: 'select',
              options: [{ label: 'Google', value: 'google' }],
              required: true,
            },
            {
              name: 'providerUserId',
              type: 'text',
              required: true,
              admin: { description: 'Mirror of the top-level providerUserId for this provider.' },
            },
            {
              name: 'accessToken',
              type: 'text',
              admin: { readOnly: true },
            },
            {
              name: 'refreshToken',
              type: 'text',
              admin: { readOnly: true },
            },
            {
              name: 'tokenExpiry',
              type: 'date',
              admin: { readOnly: true },
            },
            {
              name: 'linkedAt',
              type: 'date',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [slugifyDisplayName],
  },
}
