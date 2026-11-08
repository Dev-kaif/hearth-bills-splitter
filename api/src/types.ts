import z from "zod"
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

export const createHomeSchema = z.object({
    name: z.string().trim().min(1).max(100),
})

export const createMemberSchema = z.object({
    name: z.string().trim().min(1).max(100),
}).strict()