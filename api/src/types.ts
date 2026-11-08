import type { AuthType } from "./utils/auth"

export type Bindings = {
    DB: D1Database
    BUCKET: R2Bucket
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
    FRONTEND_URL: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
}

export type Variables = {
    user: AuthType['user']
    session: AuthType['session']
}