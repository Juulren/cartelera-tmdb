import { useCallback, useEffect, useState } from 'react';
import { getPopular, searchMovies } from './api/movies.js';
import { useDebounce, useOnlineStatus } from './hooks.js';
import MovieDetail from './components/MovieDetail.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import SearchBar from './components/SearchBar.jsx';
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

  const title = query ? `Resultados para «${query}»` : 'Películas populares';

  return (
    <main className="app">
      {!online && (
        <div className="banner" role="alert">
          Sin conexión. Se reintentará solo cuando vuelva la red.
        </div>
      )}
      <header>
        <h1>Cartelera</h1>
        <SearchBar value={input} onChange={setInput} />
        <h2 className="section-title">{title}</h2>
      </header>

      {loading && <StatusMessage kind="loading">Cargando películas…</StatusMessage>}
      {!loading && movies.length > 0 && <MovieGrid movies={movies} onSelect={setSelectedId} />}
      {failure && (
        <StatusMessage kind="error" onRetry={retry} retryAfter={failure.err.retryAfter}>
          {failure.err.message}
        </StatusMessage>
      )}
      {!loading && !failure && movies.length === 0 && (
        <StatusMessage kind="empty">No se encontraron películas para «{query}».</StatusMessage>
      )}
      {!loading && !failure && page < totalPages && (
        <button type="button" className="more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
      {selectedId && <MovieDetail id={selectedId} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
