import { useCallback, useEffect, useState } from 'react';
import { useOnlineStatus } from './hooks.js';

// Carga una lista paginada de películas. `fetchPage(page, signal)` debe estar memorizada
// (useCallback): cuando cambia, la lista se reinicia desde la página 1.
export function usePagedMovies(fetchPage) {
  const online = useOnlineStatus();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // { err, where }: where indica qué reintentar ('load' = primera página, 'more' = siguiente)
  const [failure, setFailure] = useState(null);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setFailure(null);
      try {
        const data = await fetchPage(1, signal);
        setMovies(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
        setTotal(data.total_results);
      } catch (err) {
        if (signal?.aborted) return; // cancelada por un cambio de filtros más nuevo
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
      // TMDB a veces repite una película entre páginas: se descartan las ya mostradas.
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...data.results.filter((m) => !seen.has(m.id))];
      });
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

  return {
    movies,
    total,
    loading,
    loadingMore,
    failure,
    canLoadMore: page < totalPages,
    loadMore,
    retry,
  };
}
