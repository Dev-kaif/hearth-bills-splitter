import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-plugin'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const migrations = await readD1Migrations('./migrations')

  // Setup the test enviorment for accessing api without Auth
  const envFile = resolve(process.cwd(), '.env')
  const testSetting = existsSync(envFile)
    ? readFileSync(envFile, 'utf8').toString().match(/^\s*TEST\s*=\s*(?:['"]([^'"]*)['"]|([^#\s]+))/im)
    : null
  const testAuthBypass = (testSetting?.[1] ?? testSetting?.[2]) === 'true'

  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: {
            TEST_MIGRATIONS: migrations,
            TEST_AUTH_BYPASS: String(testAuthBypass),
          },
        },
      }),
    ],
    test: {
      setupFiles: ['./test/apply-migrations.ts'],
    },
  }
})
