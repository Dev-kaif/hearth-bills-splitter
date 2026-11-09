import { Hono } from 'hono'
import { type Bindings, type HomeDetailRow, type HomeListRow, type Variables } from '../types'
import { apiError, createHomeSchema } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()

// create Home
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


// List owned active homes
router.get('/homes', async (c) => {
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    try {
        const result = await c.env.DB.prepare(`
            SELECT
                id,
                name,
                created_at
            FROM homes
            WHERE owner_user_id = ?
                AND archived_at IS NULL
            ORDER BY
                created_at DESC,
                id ASC
        `)
            .bind(userId)
            .all<HomeListRow>()

        const homes = (result.results ?? []).map((home) => ({
            id: home.id,
            name: home.name,
            createdAt: home.created_at,
        }))

        return c.json({ homes }, 200)

    } catch (error) {
        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to retrieve homes', {
            requestId,
            userId,
            error,
        })

        return c.json({
            error: 'Unable to retrieve homes',
            requestId,
        }, 500)
    }
})


// Get one home with all members
router.get('/homes/:homeId', async (c) => {
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    const homeId = c.req.param('homeId')

    try {
        const result = await c.env.DB.prepare(`
            SELECT
                h.id AS home_id,
                h.name AS home_name,
                h.created_at AS home_created_at,
                h.archived_at AS home_archived_at,

                m.id AS member_id,
                m.name AS member_name,
                m.position AS member_position,
                m.archived_at AS member_archived_at

            FROM homes h

            LEFT JOIN members m
                ON m.home_id = h.id

            WHERE h.id = ?
                AND h.owner_user_id = ?

            ORDER BY
                m.position ASC,
                m.id ASC
        `)
            .bind(homeId, userId)
            .all<HomeDetailRow>()

        const rows = result.results ?? []

        if (rows.length === 0) {
            return apiError(c, 404, 'Home not found')
        }

        const firstRow = rows[0]!

        const members = rows.flatMap((row) => {
            // LEFT JOIN produces a null member when the home has no members.
            if (row.member_id === null) {
                return []
            }

            if (
                row.member_name === null ||
                row.member_position === null
            ) {
                throw new Error('Invalid home member data')
            }

            return [{
                id: row.member_id,
                name: row.member_name,
                position: row.member_position,
                archivedAt: row.member_archived_at,
            }]
        })

        return c.json({
            id: firstRow.home_id,
            name: firstRow.home_name,
            createdAt: firstRow.home_created_at,
            archivedAt: firstRow.home_archived_at,
            members,
        }, 200)

    } catch (error) {
        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to retrieve home details', {
            requestId,
            homeId,
            error,
        })

        return c.json({
            error: 'Unable to retrieve home',
            requestId,
        }, 500)
    }
})

export default router;