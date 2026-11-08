import { Hono } from 'hono'
import {
    type Bindings,
    type Variables,
} from '../types'

import { apiError, createBillSchema } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()

type HomeStatusRow = {
    member_count: number
}

type ShareRow = {
    id: string
    member_id: string
    amount_cents: number
    paid_at: string | null
}

router.post('/homes/:homeId/bills', async (c) => {
    // parse request body
    let body: unknown

    try {
        body = await c.req.json()
    } catch {
        return apiError(c, 400, 'Invalid JSON body')
    }

    // Validate request body
    const parsed = createBillSchema.safeParse(body)

    if (!parsed.success) {
        return apiError(c, 422, 'Invalid bill details')
    }

    const { title, totalCents } = parsed.data
    const homeId = c.req.param('homeId')
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    try {
        // Verify home ownership and check for active members
        const home = await c.env.DB.prepare(`
            SELECT COUNT(m.id) AS member_count
            FROM homes h
            LEFT JOIN members m
                ON m.home_id = h.id
                AND m.archived_at IS NULL
            WHERE h.id = ?
                AND h.owner_user_id = ?
                AND h.archived_at IS NULL
            GROUP BY h.id
        `)
            .bind(homeId, userId)
            .first<HomeStatusRow>()

        if (!home) {
            return apiError(c, 404, 'Home not found')
        }

        if (home.member_count === 0) {
            return apiError(
                c,
                422,
                'Add at least one active member before creating a bill'
            )
        }

        // Generate bill ID
        const billId = crypto.randomUUID()

        // Execute bill creation, share creation and share retrieval atomically
        const results = await c.env.DB.batch([

            // Query 1: Create bill only if the home still exists,
            // belongs to the authenticated user and has active members.
            c.env.DB.prepare(`
                INSERT INTO bills (
                    id,
                    home_id,
                    title,
                    total_cents
                )
                SELECT
                    ?,
                    h.id,
                    ?,
                    ?
                FROM homes h
                WHERE h.id = ?
                    AND h.owner_user_id = ?
                    AND h.archived_at IS NULL
                    AND EXISTS (
                        SELECT 1
                        FROM members m
                        WHERE m.home_id = h.id
                            AND m.archived_at IS NULL
                    )
            `).bind(
                billId,
                title,
                totalCents,
                homeId,
                userId
            ),

            // Query 2: Generate one share for every active member.
            // Distribute remaining cents by member position.
            c.env.DB.prepare(`
                WITH bill AS (
                    SELECT
                        id,
                        home_id,
                        total_cents
                    FROM bills
                    WHERE id = ?
                        AND home_id = ?
                ),

                ranked_members AS (
                    SELECT
                        m.id AS member_id,

                        ROW_NUMBER() OVER (
                            ORDER BY m.position ASC, m.id ASC
                        ) AS member_rank,

                        COUNT(*) OVER () AS member_count

                    FROM members m

                    INNER JOIN bill
                        ON bill.home_id = m.home_id

                    WHERE m.archived_at IS NULL
                )

                INSERT INTO shares (
                    id,
                    bill_id,
                    member_id,
                    amount_cents
                )

                SELECT
                    lower(hex(randomblob(16))),
                    bill.id,
                    ranked_members.member_id,

                    (bill.total_cents / ranked_members.member_count)
                    +
                    CASE
                        WHEN ranked_members.member_rank <=
                            (bill.total_cents % ranked_members.member_count)
                        THEN 1
                        ELSE 0
                    END

                FROM bill
                CROSS JOIN ranked_members
            `).bind(billId, homeId),

            // Query 3: Retrieve the shares created for the response.
            c.env.DB.prepare(`
                SELECT
                    s.id,
                    s.member_id,
                    s.amount_cents,
                    s.paid_at

                FROM shares s

                INNER JOIN members m
                    ON m.id = s.member_id

                WHERE s.bill_id = ?

                ORDER BY
                    m.position ASC,
                    m.id ASC
            `).bind(billId),
        ])

        // Check whether the conditional bill insertion succeeded.
        const billChanges = results[0]?.meta.changes ?? 0

        if (billChanges !== 1) {

            // The home or its membership may have changed
            // between the initial check and the batch.
            const currentHome = await c.env.DB.prepare(`
                SELECT COUNT(m.id) AS member_count
                FROM homes h
                LEFT JOIN members m
                    ON m.home_id = h.id
                    AND m.archived_at IS NULL
                WHERE h.id = ?
                    AND h.owner_user_id = ?
                    AND h.archived_at IS NULL
                GROUP BY h.id
            `)
                .bind(homeId, userId)
                .first<HomeStatusRow>()

            if (!currentHome) {
                return apiError(c, 404, 'Home not found')
            }

            if (currentHome.member_count === 0) {
                return apiError(
                    c,
                    422,
                    'Add at least one active member before creating a bill'
                )
            }

            return apiError(
                c,
                409,
                'Home changed while creating the bill. Please retry.'
            )
        }

        // Format shares for the API response.
        const shareRows = (results[2]?.results ?? []) as ShareRow[]

        const shares = shareRows.map((share) => ({
            id: share.id,
            memberId: share.member_id,
            amountCents: share.amount_cents,
            paidAt: share.paid_at,
        }))

        // The batch should always create at least one share
        // because the bill insertion requires an active member.
        if (
            shares.length === 0 ||
            results[1]?.meta.changes !== shares.length
        ) {
            console.error('Bill/share consistency error', {
                billId,
                homeId,
                shareInsertCount: results[1]?.meta.changes,
                retrievedShareCount: shares.length,
            })
            return apiError(c, 500, 'Unable to create bill shares')
        }

        // Return created bill and shares.
        return c.json({
            id: billId,
            homeId,
            title,
            totalCents,
            shares,
        }, 201)

    } catch (error) {
        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to create bill', {
            requestId,
            homeId,
            error,
        })

        return c.json({
            error: 'Unable to create bill',
            requestId,
        }, 500)
    }
})

export default router