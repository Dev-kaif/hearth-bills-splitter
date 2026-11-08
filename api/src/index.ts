import { Hono } from 'hono'
import type { Bindings, Variables } from './types';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/authorize';
import auth from './routes/auth'
import homes from './routes/homes'
import members from './routes/members'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>({
    strict: false,
})

app.get('/api/health', (c) => {
    return c.json({ status: 'ok' })
})

app.use(
    '*',
    cors({
        origin: '*',
        credentials: false,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    }),
)

app.route('/api/auth/', auth)

app.use('*', authMiddleware)

const api = app.basePath('/api')

const routes = [homes, members,] as const

routes.forEach((route) => {
    api.route('/', route)
})


export default app
