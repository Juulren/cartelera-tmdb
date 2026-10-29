import { useCallback, useEffect, useState } from 'react';
import { getPopular, searchMovies } from './api/movies.js';
import { useDebounce, useOnlineStatus } from './hooks.js';
import Hero from './components/Hero.jsx';
import MovieDetail from './components/MovieDetail.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import SearchBar from './components/SearchBar.jsx';
import SkeletonGrid from './components/SkeletonGrid.jsx';
import StatusMessage from './components/StatusMessage.jsx';

export default function App() {
  const [input, setInput] = useState('');
  const query = useDebounce(input.trim(), 400);
  const online = useOnlineStatus();
  const [selectedId, setSelectedId] = useState(null);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // { err, where }: where indica qué reintentar ('load' = primera página, 'more' = siguiente)
  const [failure, setFailure] = useState(null);

  const fetchPage = useCallback(
    (p, signal) => (query ? searchMovies(query, p, signal) : getPopular(p, signal)),
    [query]
  );

  // Primera página: se reinicia cada vez que cambia la búsqueda.
  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setFailure(null);
      try {
        const data = await fetchPage(1, signal);
        setMovies(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
      } catch (err) {
        if (signal?.aborted) return; // petición cancelada por una búsqueda más nueva
        setMovies([]);
        setFailure({ err, where: 'load' });
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setFailure(null);
    try {
      const data = await fetchPage(page + 1);
      setMovies((prev) => [...prev, ...data.results]);
      setPage(page + 1);
      setTotalPages(data.total_pages);
    } catch (err) {
      setFailure({ err, where: 'more' });
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, page]);

  const retry = useCallback(
    () => (failure?.where === 'more' ? loadMore() : load()),
    [failure, load, loadMore]
  );

  // Si volvió la conexión y había fallado por falta de red, reintentar solo.
  useEffect(() => {
    if (online && failure && ['offline', 'network'].includes(failure.err.code)) retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const title = query ? `Resultados para «${query}»` : 'Populares ahora';

  // La portada destaca la primera película con imagen de fondo; no se repite en la rejilla.
  const featured = !query && !failure ? movies.find((m) => m.backdrop_path) : null;
  const gridMovies = featured ? movies.filter((m) => m.id !== featured.id) : movies;

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <h1 className="brand">Cartelera</h1>
          <SearchBar value={input} onChange={setInput} />
        </div>
      </header>

      {!online && (
        <div className="banner" role="alert">
          Sin conexión. Se reintentará solo cuando vuelva la red.
        </div>
      )}

      {loading && !query && <div className="hero hero--skeleton" aria-hidden="true" />}
      {!loading && featured && <Hero movie={featured} onSelect={setSelectedId} />}

      <main className="app">
        <h2 className="section-title">{title}</h2>

        {loading && <SkeletonGrid />}
        {!loading && gridMovies.length > 0 && (
          <MovieGrid movies={gridMovies} onSelect={setSelectedId} />
        )}
        {failure && (
          <StatusMessage kind="error" onRetry={retry} retryAfter={failure.err.retryAfter}>
            {failure.err.message}
          </StatusMessage>
        )}
        {!loading && !failure && movies.length === 0 && (
          <StatusMessage kind="empty">
            {query
              ? `No encontramos «${query}». Prueba con otro título o revisa la ortografía.`
              : 'No hay películas para mostrar por ahora.'}
          </StatusMessage>
        )}
        {!loading && !failure && page < totalPages && (
          <button type="button" className="btn btn--outline more" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Cargando…' : 'Cargar más películas'}
          </button>
        )}
      </main>

      <footer className="footer">
        <p>
          Datos e imágenes de{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            The Movie Database (TMDB)
          </a>
          . Esta app no está respaldada ni certificada por TMDB.
        </p>
      </footer>

      {selectedId && <MovieDetail id={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}
