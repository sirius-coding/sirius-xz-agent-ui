export class ApiError extends Error {
  readonly status?: number;
  readonly payload?: unknown;

  constructor(message: string, options?: { status?: number; payload?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.payload = options?.payload;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function withApiBase(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const bypassBasePrefix = normalizedPath === '/actuator' || normalizedPath.startsWith('/actuator/');

  if (bypassBasePrefix) {
    return normalizedPath;
  }

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const dedupeApiPrefix =
    normalizedBase.endsWith('/api') &&
    (normalizedPath === '/api' || normalizedPath.startsWith('/api/'));

  if (dedupeApiPrefix) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('json')) {
    return response.json();
  }

  return response.text();
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers: initHeaders, ...restInit } = init ?? {};
  const hasBody = init?.body !== undefined && init?.body !== null;
  const method = (restInit.method ?? 'GET').toUpperCase();
  const headers = new Headers(initHeaders ?? {});

  if (hasBody && !headers.has('Content-Type') && method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(withApiBase(path), {
    ...restInit,
    headers
  });

  if (!response.ok) {
    throw new ApiError(`Request failed for ${path}`, {
      status: response.status,
      payload: await readResponseBody(response)
    });
  }

  return (await readResponseBody(response)) as T;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}
