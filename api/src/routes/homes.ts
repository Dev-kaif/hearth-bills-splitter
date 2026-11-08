import { Hono } from 'hono'
import { type Bindings, type Variables } from '../types'
import { createHomeSchema } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()

router.post('/homes', async (c) => {

    // 1. Parse JSON safely.
    let body: unknown

    try {
        body = await c.req.json()
    } catch {
        return c.json({ error: 'Malformed JSON body' }, 400)
    }

    // 2. Validate input.
    const parsed = createHomeSchema.safeParse(body)

    if (!parsed.success) {
        return c.json({
            error: 'Invalid home name',
        }, 422)
    }

    // Resolve authenticated owner.
    const user = c.get('user') ?? null


    // Defence in depth: don't rely exclusively on middleware.
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const id = crypto.randomUUID()
    const name = parsed.data.name

    // Persist.
    try {
        await c.env.DB.prepare(`
            INSERT INTO homes (id, owner_user_id, name)
            VALUES (?, ?, ?)
        `)
            .bind(id, user.id, name)
            .run()

        return c.json({ id, name }, 201)

    } catch (error) {
        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to create home', {
            requestId,
            error,
        })

        return c.json({
            error: 'Unable to create home',
            requestId,
        }, 500)
    }
})

export default router;