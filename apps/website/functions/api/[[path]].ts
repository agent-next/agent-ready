/// <reference types="@cloudflare/workers-types" />

// Proxy API requests to the backend server
const BACKEND_URL = 'https://api.agent-ready.org';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://agent-ready.org',
  'https://www.agent-ready.org',
  'http://localhost:5173',
  'http://localhost:4173',
];

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  // Default to production origin if not in allowlist
  return ALLOWED_ORIGINS[0];
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api', '');
  const backendUrl = `${BACKEND_URL}/api${path}${url.search}`;
  const corsOrigin = getCorsOrigin(context.request);

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const response = await fetch(backendUrl, {
      method: context.request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: context.request.method !== 'GET' ? await context.request.text() : undefined,
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
      },
    });
  } catch (error) {
    // Log the actual error server-side but return generic message to client
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
      },
    });
  }
};
