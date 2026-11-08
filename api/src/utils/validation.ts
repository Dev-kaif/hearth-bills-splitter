import type { Context } from 'hono'
import { z } from 'zod'

// Helpers

export function validationError(c: Context, error: z.ZodError) {
    return c.json(
        {
            error: 'Validation failed',
            details: error.flatten(),
        },
        400,
    )
}

export function apiError(c: Context, status: 400 | 401 | 403 | 404 | 409 | 500, message: string) {
    return c.json(
        {
            error: message,
        },
        status,
    )
}
