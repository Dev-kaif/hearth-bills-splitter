import { Hono } from 'hono'
import type { Bindings, PaymentRow, Variables, IdempotencyOwnerRow } from '../types'
import { apiError } from '../utils/validation'

const router = new Hono<{
    Bindings: Bindings
    Variables: Variables
}>()



function formatPayment(share: PaymentRow) {
    return {
        id: share.id,
        billId: share.bill_id,
        memberId: share.member_id,
        amountCents: share.amount_cents,
        paidAt: share.paid_at,
    }
}

router.post('/bills/:billId/shares/:shareId/pay', async (c) => {
    const userId = c.get('user')?.id

    if (!userId) {
        return apiError(c, 401, 'Unauthorized')
    }

    const billId = c.req.param('billId')
    const shareId = c.req.param('shareId')

    // Idempotency key is mandatory.
    const rawKey = c.req.header('Idempotency-Key')

    if (rawKey === undefined) {
        return apiError(c, 400, 'Idempotency-Key header is required')
    }

    const idempotencyKey = rawKey.trim()

    if (idempotencyKey.length === 0 || idempotencyKey.length > 128) {
        return apiError(
            c,
            400,
            'Idempotency-Key must contain between 1 and 128 characters'
        )
    }

    try {
        // Atomically mark the share as paid.
        // Ownership is checked inside the UPDATE.
        // Archived members and homes remain eligible for historical payments.
        const updated = await c.env.DB.prepare(`
            UPDATE shares

            SET
                paid_at = CURRENT_TIMESTAMP,
                idempotency_key = ?

            WHERE id = ?
                AND bill_id = ?
                AND paid_at IS NULL

                AND EXISTS (
                    SELECT 1
                    FROM bills b
                    INNER JOIN homes h
                        ON h.id = b.home_id
                    WHERE b.id = shares.bill_id
                        AND h.owner_user_id = ?
                )

            RETURNING
                id,
                bill_id,
                member_id,
                amount_cents,
                paid_at,
                idempotency_key
        `)
            .bind(idempotencyKey, shareId, billId, userId)
            .first<PaymentRow>()

        if (updated) {
            return c.json(formatPayment(updated), 200)
        }

        // The conditional UPDATE affected no rows.
        // Check whether this is a retry or an invalid share.
        const existing = await c.env.DB.prepare(`
            SELECT
                s.id,
                s.bill_id,
                s.member_id,
                s.amount_cents,
                s.paid_at,
                s.idempotency_key

            FROM shares s

            INNER JOIN bills b
                ON b.id = s.bill_id

            INNER JOIN homes h
                ON h.id = b.home_id

            WHERE s.id = ?
                AND s.bill_id = ?
                AND h.owner_user_id = ?
        `)
            .bind(shareId, billId, userId)
            .first<PaymentRow>()

        if (!existing) {
            return apiError(c, 404, 'Share not found')
        }

        if (existing.paid_at !== null) {
            if (existing.idempotency_key === idempotencyKey) {
                // Same operation retried. Return the original result.
                return c.json(formatPayment(existing), 200)
            }

            return apiError(c, 409, 'Share has already been paid')
        }

        return apiError(
            c,
            409,
            'Unable to mark share as paid. Please retry.'
        )

    } catch (error) {
        // The unique database index prevents reusing a key
        // for another share, even under concurrent requests.
        try {
            const keyOwner = await c.env.DB.prepare(`
                SELECT id, bill_id
                FROM shares
                WHERE idempotency_key = ?
            `)
                .bind(idempotencyKey)
                .first<IdempotencyOwnerRow>()

            if (
                keyOwner &&
                (keyOwner.id !== shareId || keyOwner.bill_id !== billId)
            ) {
                return apiError(c, 409, 'Idempotency key has already been used')
            }
        } catch (lookupError) {
            console.error('Failed to inspect idempotency key', {
                shareId,
                lookupError,
            })
        }

        const requestId = c.req.header('cf-ray') ?? crypto.randomUUID()

        console.error('Failed to mark share as paid', {
            requestId,
            billId,
            shareId,
            error,
        })

        return c.json({
            error: 'Unable to process payment',
            requestId,
        }, 500)
    }
})

export default router