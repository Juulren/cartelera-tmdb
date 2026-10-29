import express from 'express';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-MX';
const PORT = process.env.PORT || 3001;
const TIMEOUT_MS = 8000;

const rawKey = process.env.TMDB_API_KEY;
const hasKey = Boolean(rawKey) && rawKey !== 'tu_clave_aqui';
// El token v4 es un JWT (empieza con "eyJ") y va en el header; la key v3 va en la query.
const isBearer = hasKey && rawKey.startsWith('eyJ');

if (!hasKey) {
  console.error('[server] Falta TMDB_API_KEY. Copia .env.example a .env y pega tu clave.');
}

const app = express();

function sendError(res, status, code, error, extra = {}) {
  res.status(status).json({ code, error, ...extra });
}

// Llama a TMDB desde el servidor para que la key nunca llegue al navegador.
async function tmdb(res, path, params = {}) {
  if (!hasKey) {
    return sendError(res, 500, 'auth', 'El servidor no tiene configurada la API key de TMDB.');
  }

  const url = new URL(TMDB_BASE + path);
  url.searchParams.set('language', LANGUAGE);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (!isBearer) url.searchParams.set('api_key', rawKey);

  try {
    const upstream = await fetch(url, {
      headers: isBearer ? { Authorization: `Bearer ${rawKey}` } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (upstream.status === 429) {
      const retryAfter = Number(upstream.headers.get('retry-after')) || 10;
      res.set('Retry-After', String(retryAfter));
      return sendError(res, 429, 'rate_limit', 'Demasiadas peticiones a TMDB.', { retryAfter });
    }
    if (upstream.status === 401) {
      return sendError(res, 401, 'auth', 'La API key de TMDB no es válida.');
    }
    if (upstream.status === 404) {
      return sendError(res, 404, 'not_found', 'No se encontró el recurso solicitado.');
    }
    if (!upstream.ok) {
      return sendError(res, 502, 'server', `TMDB respondió con error ${upstream.status}.`);
    }

    res.json(await upstream.json());
  } catch (err) {
    const timedOut = err.name === 'TimeoutError' || err.name === 'AbortError';
    sendError(
      res,
      timedOut ? 504 : 502,
      'server',
      timedOut ? 'TMDB tardó demasiado en responder.' : 'No se pudo contactar a TMDB.'
    );
  }
}

const pageOf = (req) => Math.max(1, Number.parseInt(req.query.page, 10) || 1);

app.get('/api/popular', (req, res) => tmdb(res, '/movie/popular', { page: pageOf(req) }));

app.get('/api/search', (req, res) => {
  const query = String(req.query.query ?? '').trim();
  if (!query) return sendError(res, 400, 'bad_request', 'Falta el texto de búsqueda.');
  tmdb(res, '/search/movie', { query, page: pageOf(req) });
});

app.get('/api/movie/:id', (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return sendError(res, 400, 'bad_request', 'Id de película inválido.');
  }
  tmdb(res, `/movie/${req.params.id}`);
});

app.listen(PORT, () => console.log(`[server] API proxy en http://localhost:${PORT}`));
