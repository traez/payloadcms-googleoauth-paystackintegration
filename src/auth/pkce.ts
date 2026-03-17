//src\auth\pkce.ts
import crypto from 'crypto'

/**
 * Generates a cryptographically random code verifier.
 * RFC 7636 §4.1 — must be 43–128 URL-safe characters.
 */
export function generateCodeVerifier(): string {
  // 32 bytes → 43 base64url chars (well within the 43–128 range)
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Derives a code challenge from the verifier using SHA-256.
 * RFC 7636 §4.2 — S256 method.
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}