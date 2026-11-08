import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'
import { createAuth } from '../utils/auth'

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

router.on(['POST', 'GET'], '/*', (c) => {
    const auth = createAuth(c.env)
    return auth.handler(c.req.raw)
})

export default router