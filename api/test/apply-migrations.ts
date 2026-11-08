import { applyD1Migrations } from 'cloudflare:test'
import { env } from 'cloudflare:workers'


await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

await env.DB.prepare(`
    INSERT OR IGNORE INTO user (
        id,
        name,
        email,
        emailVerified,
        createdAt,
        updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?)
`).bind(
    'test-user-id',
    'Test User',
    'test@example.com',
    1,
    Date.now(),
    Date.now()
).run()