import { Hono } from 'hono'
import type { BalanceRow, Bindings, Variables } from '../types'
import { apiError } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()


router.get('/homes/:homeId/balances', async (c) => {
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    const homeId = c.req.param('homeId')

    try {
        const result = await c.env.DB.prepare(`
            SELECT
                m.id AS member_id,
                m.name AS member_name,

                COALESCE(
                    SUM(
                        CASE
                            WHEN s.id IS NOT NULL
                                AND s.paid_at IS NULL
                            THEN s.amount_cents
                            ELSE 0
                        END
                    ),
                    0
                ) AS outstanding_cents

            FROM homes h

            LEFT JOIN members m
                ON m.home_id = h.id

            LEFT JOIN bills b
                ON b.home_id = h.id

            LEFT JOIN shares s
                ON s.bill_id = b.id
                AND s.member_id = m.id

            WHERE h.id = ?
                AND h.owner_user_id = ?

            GROUP BY
                h.id,
                m.id,
                m.name,
                m.position

            ORDER BY
                m.position ASC,
                m.id ASC
        `)
            .bind(homeId, userId)
            .all<BalanceRow>()

        const rows = result.results ?? []

        // No rows means the home does not exist
        // or does not belong to the authenticated user.
        if (rows.length === 0) {
            return apiError(c, 404, 'Home not found')
        }

        const balances = rows
            .filter((row) => row.member_id !== null)
            .map((row) => {
                if (
                    !Number.isSafeInteger(row.outstanding_cents) ||
                    row.outstanding_cents < 0
                ) {
                    throw new Error('Invalid outstanding balance')
                }

                return {
                    memberId: row.member_id as string,
                    name: row.member_name as string,
                    outstandingCents: row.outstanding_cents,
                }
            })

        return c.json({ balances }, 200)

    } catch (error) {
        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to calculate home balances', {
            requestId,
            homeId,
            error,
        })

        return c.json({
            error: 'Unable to retrieve balances',
            requestId,
        }, 500)
    }
})

export default router