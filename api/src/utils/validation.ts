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

export function apiError(c: Context, status: 400 | 401 | 422 | 403 | 404 | 409 | 500, message: string) {
    return c.json(
        {
            error: message,
        },
        status,
    )
}


export const createHomeSchema = z.object({
    name: z.string().trim().min(1).max(100),
})

export const createMemberSchema = z.object({
    name: z.string().trim().min(1).max(100),
}).strict()

export const createBillSchema = z.object({
    title: z.string().trim().min(1).max(100),
    totalCents: z.number()
        .int()
        .positive()
        .max(Number.MAX_SAFE_INTEGER),
}).strict()
