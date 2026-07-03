/**
 * Fail-fast validation of critical environment variables at boot.
 *
 * A missing secret or database URL must crash the process loudly at startup
 * rather than silently degrading (e.g. signing JWTs with a default secret, or
 * connecting to `undefined`). Skipped under the test runner.
 */

const REQUIRED_VARS = ['JWT_ACCESS_SECRET', 'MONGODB_URI'] as const

export const validateEnv = (): void => {
  if (process.env.NODE_ENV === 'test') return

  const missing = REQUIRED_VARS.filter((key) => !process.env[key]?.trim())
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}
