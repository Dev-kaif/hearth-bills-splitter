import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types'
import { createAuth } from '../utils/auth'
import { apiError } from '../utils/validation'

export const authMiddleware = createMiddleware<{
    Bindings: Bindings
    Variables: Variables
}>(async (c, next) => {
    
    // This binding is supplied only by the Vitest Miniflare configuration.
    // It is not sourced from a request, and is absent from Wrangler environments.
    if (c.env.TEST_AUTH_BYPASS === 'true') {
        await next()
        return
    }

    const authInstance = createAuth(c.env)

    const session = await authInstance.api.getSession({
        headers: c.req.raw.headers,
    })

    if (!session) {
        return apiError(c, 401, 'Unauthorized')
    }

    c.set('user', session.user)
    c.set('session', session.session)

    await next()
})
