import express from 'express';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const LANGUAGE = 'es-MX';
// Variable propia (no PORT) para no chocar con la que definen otras herramientas.
const PORT = process.env.API_PORT || 3001;
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

// TMDB falla de vez en cuando (5xx, cortes de red): un GET es seguro de repetir, así que
// se reintenta una vez antes de rendirse. Cada fallo queda en el log para poder diagnosticarlo.
async function fetchTmdb(url, path) {
  const options = () => ({
    headers: isBearer ? { Authorization: `Bearer ${rawKey}` } : {},
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, options());
      if (res.status < 500 || attempt === 2) return res;
      console.error(`[server] TMDB ${path} respondió ${res.status} (intento ${attempt})`);
    } catch (err) {
      console.error(`[server] TMDB ${path} falló: ${err.name}: ${err.message} (intento ${attempt})`);
      if (attempt === 2) throw err;
    }
  }
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
    const upstream = await fetchTmdb(url, path);

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
  const params = { query, page: pageOf(req), include_adult: 'false' };
  if (/^\d{4}$/.test(req.query.year)) params.primary_release_year = req.query.year;
  tmdb(res, '/search/movie', params);
});

// Orden permitido -> filtros extra para que el resultado tenga sentido
// (sin ellos, "mejor calificadas" se llena de películas con 1 voto).
const SORTS = {
  'popularity.desc': {},
  'vote_average.desc': { 'vote_count.gte': 300 },
  'primary_release_date.desc': { 'vote_count.gte': 10 },
  'primary_release_date.asc': { 'vote_count.gte': 50 },
};

// Catálogo con filtros: ?genres=28,12&year=2020&min_rating=7&sort_by=vote_average.desc&page=2
app.get('/api/discover', (req, res) => {
  const sort = Object.hasOwn(SORTS, req.query.sort_by) ? req.query.sort_by : 'popularity.desc';
  const params = { page: pageOf(req), sort_by: sort, include_adult: 'false', ...SORTS[sort] };

  if (sort === 'primary_release_date.desc') {
    // Sin esto, lo primero serían estrenos futuros que aún no tienen ni póster.
    params['primary_release_date.lte'] = new Date().toISOString().slice(0, 10);
  }

  const genres = String(req.query.genres ?? '')
    .split(',')
    .filter((g) => /^\d+$/.test(g));
  if (genres.length) params.with_genres = genres.join(',');

  if (/^\d{4}$/.test(req.query.year)) params.primary_release_year = req.query.year;

  const minRating = Number(req.query.min_rating);
  if (minRating >= 1 && minRating <= 9) {
    params['vote_average.gte'] = minRating;
    params['vote_count.gte'] = Math.max(params['vote_count.gte'] ?? 0, 50);
  }

  tmdb(res, '/discover/movie', params);
});

app.get('/api/movie/:id', (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return sendError(res, 400, 'bad_request', 'Id de película inválido.');
  }
  tmdb(res, `/movie/${req.params.id}`);
});

const server = app.listen(PORT, () =>
  console.log(`[server] API proxy en http://localhost:${PORT}`)
);
// Si el puerto está ocupado, avisar y salir en vez de fingir que arrancó.
server.on('error', (err) => {
  console.error(`[server] No se pudo abrir el puerto ${PORT}: ${err.message}`);
  process.exit(1);
});
