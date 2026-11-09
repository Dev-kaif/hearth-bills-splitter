interface PagesRequestContext {
  request: Request
  env: {
    API_ORIGIN?: string
  }
}

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
]

function removeHopByHopHeaders(headers: Headers): Headers {
  const result = new Headers(headers)
  const connectionTokens = result
    .get('connection')
    ?.split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)

  for (const header of HOP_BY_HOP_HEADERS) {
    result.delete(header)
  }

  for (const token of connectionTokens ?? []) {
    result.delete(token)
  }

  return result
}

export async function onRequest({ request, env }: PagesRequestContext): Promise<Response> {
  if (!env.API_ORIGIN) {
    return Response.json(
      { error: 'The API proxy is not configured. Set the API_ORIGIN Pages variable.' },
      { status: 503 },
    )
  }

  let backendOrigin: URL
  try {
    backendOrigin = new URL(env.API_ORIGIN)
  } catch {
    return Response.json(
      { error: 'The API_ORIGIN Pages variable must be a valid URL.' },
      { status: 500 },
    )
  }

  if (
    backendOrigin.protocol !== 'https:' ||
    backendOrigin.username ||
    backendOrigin.password ||
    backendOrigin.pathname !== '/' ||
    backendOrigin.search ||
    backendOrigin.hash
  ) {
    return Response.json(
      { error: 'API_ORIGIN must be an HTTPS origin without a path.' },
      { status: 500 },
    )
  }

  const incomingUrl = new URL(request.url)
  const backendUrl = new URL(incomingUrl.pathname + incomingUrl.search, backendOrigin)
  const method = request.method.toUpperCase()
  const headers = removeHopByHopHeaders(request.headers)

  const upstreamRequest = new Request(backendUrl, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? null : request.body,
    redirect: 'manual',
  })

  try {
    return await fetch(upstreamRequest)
  } catch (error) {
    console.error('Cloudflare API proxy request failed', {
      method,
      path: incomingUrl.pathname,
      error,
    })

    return Response.json({ error: 'The API service is temporarily unavailable.' }, { status: 502 })
  }
}
