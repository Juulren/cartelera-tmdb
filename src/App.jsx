import { useCallback, useEffect, useState } from 'react';
import { getPopular, searchMovies } from './api/movies.js';
import { useDebounce } from './hooks.js';
import MovieGrid from './components/MovieGrid.jsx';
import SearchBar from './components/SearchBar.jsx';
import StatusMessage from './components/StatusMessage.jsx';

export default function App() {
  const [input, setInput] = useState('');
  const query = useDebounce(input.trim(), 400);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    (p, signal) => (query ? searchMovies(query, p, signal) : getPopular(p, signal)),
    [query]
  );

  // Primera página: se reinicia cada vez que cambia la búsqueda.
  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPage(1, signal);
        setMovies(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
      } catch (err) {
        if (signal?.aborted) return; // petición cancelada por una búsqueda más nueva
        setMovies([]);
        setError(err.message);
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

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await fetchPage(page + 1);
      setMovies((prev) => [...prev, ...data.results]);
      setPage(page + 1);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  const title = query ? `Resultados para «${query}»` : 'Películas populares';

  return (
    <main className="app">
      <header>
        <h1>Cartelera</h1>
        <SearchBar value={input} onChange={setInput} />
        <h2 className="section-title">{title}</h2>
      </header>

      {loading && <StatusMessage kind="loading">Cargando películas…</StatusMessage>}
      {error && (
        <StatusMessage kind="error" onRetry={() => load()}>
          {error}
        </StatusMessage>
      )}
      {!loading && !error && movies.length === 0 && (
        <StatusMessage kind="empty">No se encontraron películas para «{query}».</StatusMessage>
      )}
      {!loading && movies.length > 0 && <MovieGrid movies={movies} />}
      {!loading && !error && page < totalPages && (
        <button type="button" className="more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </main>
  );
}
