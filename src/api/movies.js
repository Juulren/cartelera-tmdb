const TIMEOUT_MS = 8000;

export const IMG_BASE = 'https://image.tmdb.org/t/p';

// Pide JSON a nuestro proxy (/api/...). Si falla, lanza un Error con el mensaje del servidor.
async function getJson(path, signal) {
  const res = await fetch(path, { signal: signal ?? AbortSignal.timeout(TIMEOUT_MS) });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Error ${res.status}`);
  return body;
}

export function getPopular(page = 1, signal) {
  return getJson(`/api/popular?page=${page}`, signal);
}
