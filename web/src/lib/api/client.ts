export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check that the API is running and try again.',
      0,
    )
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = null
  }
  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
        ? body.error
        : response.status === 401
          ? 'Your session has expired. Please sign in again.'
          : `Request failed (${response.status}).`
    throw new ApiError(message, response.status)
  }
  return body as T
}
