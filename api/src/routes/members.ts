import { Hono } from 'hono'
import { type Bindings, type MemberRow, type Variables } from '../types'
import { apiError, createMemberSchema } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()


router.post('/homes/:homeId/members', async (c) => {
    // Read and validate the request body.
    let body: unknown

    try {
        body = await c.req.json()
    } catch {
        return apiError(c, 400, 'Invalid JSON body')
    }

    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
        return apiError(
            c,
            400,
            'Name must be a non-empty string with at most 100 characters'
        )
    }

    const { name } = parsed.data
    const homeId = c.req.param('homeId')
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    // Create the member only if the authenticated user owns the home.
    try {

        const member = await c.env.DB
            .prepare(`
                INSERT INTO members (
                    id,
                    home_id,
                    name,
                    position
                )
                SELECT
                    ?,
                    h.id,
                    ?,
                    COALESCE(
                        (
                            SELECT MAX(m.position) + 1
                            FROM members m
                            WHERE m.home_id = h.id
                        ),
                        0
                    )
                FROM homes h
                WHERE h.id = ?
                  AND h.owner_user_id = ?
                  AND h.archived_at IS NULL
                RETURNING id, home_id, name, position
            `)
            .bind(
                crypto.randomUUID(),
                name,
                homeId,
                userId
            )
            .first<MemberRow>()

        // No matching row means the home doesn't exist
        // or doesn't belong to this user.
        if (!member) {
            return apiError(c, 404, 'Home not found')
        }

        // Return the created member.
        return c.json({
            id: member.id,
            homeId: member.home_id,
            name: member.name,
            position: member.position,
        }, 201)

    } catch (error) {
        console.error('Member creation DB error:', error)

        return apiError(c, 500, 'Unable to create member')
    }
})

export default router