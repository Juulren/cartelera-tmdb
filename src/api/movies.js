const TIMEOUT_MS = 8000;

export const IMG_BASE = 'https://image.tmdb.org/t/p';

// Error con un `code` para que la interfaz decida qué mostrar:
// offline | network | timeout | rate_limit | auth | not_found | server
export class ApiError extends Error {
  constructor(code, message, retryAfter = 0) {
    super(message);
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

const MESSAGES = {
  offline: 'Sin conexión a internet. Revisa tu red e inténtalo de nuevo.',
  network: 'No se pudo contactar al servidor.',
  timeout: 'El servicio tardó demasiado en responder.',
  rate_limit: 'Demasiadas peticiones. Espera un momento antes de reintentar.',
  auth: 'La API key de TMDB no es válida o falta en el servidor (.env).',
  not_found: 'No se encontró lo que buscabas.',
  server: 'El servicio no está respondiendo. Inténtalo más tarde.',
};

// Pide JSON a nuestro proxy (/api/...). Siempre hay timeout; `signal` permite cancelar.
async function getJson(path, signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  let res;
  try {
    res = await fetch(path, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  } catch (err) {
    if (signal?.aborted) throw err; // cancelada a propósito: no es un error para el usuario
    if (err.name === 'TimeoutError') throw new ApiError('timeout', MESSAGES.timeout);
    const code = navigator.onLine ? 'network' : 'offline';
    throw new ApiError(code, MESSAGES[code]);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // El proxy manda {code, error}; si Vite no logra llegar al proxy responde 5xx sin cuerpo.
    const code = body?.code ?? (res.status === 429 ? 'rate_limit' : 'server');
    const retryAfter = Number(body?.retryAfter ?? res.headers.get('retry-after')) || 0;
    throw new ApiError(code, MESSAGES[code] ?? body?.error ?? MESSAGES.server, retryAfter);
  }
  return body;
}

export function getPopular(page = 1, signal) {
  return getJson(`/api/popular?page=${page}`, signal);
}

export function searchMovies(query, page = 1, signal) {
  return getJson(`/api/search?query=${encodeURIComponent(query)}&page=${page}`, signal);
}

export function getMovie(id, signal) {
  return getJson(`/api/movie/${id}`, signal);
}
