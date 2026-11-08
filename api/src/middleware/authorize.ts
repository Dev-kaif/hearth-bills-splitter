import { createMiddleware } from 'hono/factory'
import type { Bindings, Variables } from '../types'
import { createAuth } from '../utils/auth'
import { apiError } from '../utils/validation'

export const authMiddleware = createMiddleware<{
    Bindings: Bindings
    Variables: Variables
}>(async (c, next) => {
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
