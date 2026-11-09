import type { AuthType } from "./utils/auth"

export type Bindings = {
    DB: D1Database
    BUCKET: R2Bucket
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
    FRONTEND_URL: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    /** Test-only Miniflare binding configured in vitest.config.ts. */
    TEST_AUTH_BYPASS?: string
}

export type Variables = {
    user: AuthType['user']
    session: AuthType['session']
}

export type HomeStatusRow = {
    member_count: number
}

export type ShareRow = {
    id: string
    member_id: string
    amount_cents: number
    paid_at: string | null
}

export type MemberRow = {
    id: string
    home_id: string
    name: string
    position: number
}

export type PaymentRow = {
    id: string
    bill_id: string
    member_id: string
    amount_cents: number
    paid_at: string | null
    idempotency_key: string | null
}

export type IdempotencyOwnerRow = {
    id: string
    bill_id: string
}


export type BalanceRow = {
    member_id: string | null
    member_name: string | null
    outstanding_cents: number
}