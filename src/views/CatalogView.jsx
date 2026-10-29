import { useCallback, useMemo, useState } from 'react';
import { discoverMovies, searchMovies } from '../api/movies.js';
import { useDebounce } from '../hooks.js';
import { usePagedMovies } from '../usePagedMovies.js';
import FilterBar from '../components/FilterBar.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

const DEFAULTS = { text: '', genres: [], year: '', minRating: '', sort: 'popularity.desc' };

// Orden en el navegador (solo se usa cuando hay texto, porque la búsqueda de TMDB no ordena).
const SORTERS = {
  'vote_average.desc': (a, b) => b.vote_average - a.vote_average,
  'primary_release_date.desc': (a, b) => (b.release_date || '').localeCompare(a.release_date || ''),
  'primary_release_date.asc': (a, b) => (a.release_date || '9').localeCompare(b.release_date || '9'),
};

export default function CatalogView({ onSelect }) {
  const [filters, setFilters] = useState(DEFAULTS);
  const query = useDebounce(filters.text.trim(), 400);
  const { genres, year, minRating, sort } = filters;
  const genresKey = genres.join(',');

  // Sin texto: /discover filtra en el servidor de TMDB. Con texto: /search (acepta año;
  // género, calificación y orden se aplican sobre lo ya cargado).
  const fetchPage = useCallback(
    (page, signal) =>
      query
        ? searchMovies(query, page, signal, year)
        : discoverMovies({ genres: genresKey ? genresKey.split(',') : [], year, minRating, sort }, page, signal),
    [query, genresKey, year, minRating, sort]
  );

  const { movies, total, loading, loadingMore, failure, canLoadMore, loadMore, retry } =
    usePagedMovies(fetchPage);

  const shown = useMemo(() => {
    if (!query) return movies;
    const wanted = genres;
    const list = movies.filter(
      (m) =>
        wanted.every((g) => m.genre_ids?.includes(g)) &&
        (!minRating || m.vote_average >= Number(minRating))
    );
    return SORTERS[sort] ? [...list].sort(SORTERS[sort]) : list;
  }, [movies, query, genres, minRating, sort]);

  const activeCount =
    (filters.text ? 1 : 0) + genres.length + (year ? 1 : 0) + (minRating ? 1 : 0) + (sort !== DEFAULTS.sort ? 1 : 0);
  const hasFilters = activeCount > 0;
  const clientSide = query && (genres.length > 0 || minRating || sort !== DEFAULTS.sort);

  const otherFilters = activeCount - (filters.text ? 1 : 0) > 0;
  const emptyText = query
    ? otherFilters
      ? `No encontramos «${query}» con los filtros elegidos. Quita alguno o cambia el texto.`
      : `No encontramos «${query}». Prueba con otro título o revisa la ortografía.`
    : hasFilters
      ? 'No hay películas con esta combinación. Prueba quitando algún filtro.'
      : 'No hay películas para mostrar por ahora.';

  const change = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const reset = () => setFilters(DEFAULTS);

  const title = query ? `Resultados para «${query}»` : 'Catálogo completo';
  // TMDB solo pagina hasta 500 páginas (10.000 películas) y su total puede ser engañoso.
  const count = total > 10000 ? `Más de ${(10000).toLocaleString('es-MX')}` : total.toLocaleString('es-MX');

  return (
    <main className="app">
      <h2 className="section-title">{title}</h2>

      <FilterBar filters={filters} onChange={change} onReset={reset} activeCount={activeCount} />

      {clientSide && (
        <p className="hint">
          Con una búsqueda por texto, los filtros de género, calificación y orden se aplican a los
          resultados ya cargados. Usa «Cargar más» para ver más.
        </p>
      )}

      {!loading && !failure && (
        <p className="results-count" aria-live="polite">
          {clientSide ? `${shown.length} de ${movies.length} cargadas` : `${count} ${total === 1 ? 'película' : 'películas'}`}
        </p>
      )}

      {loading && <SkeletonGrid count={12} />}
      {!loading && shown.length > 0 && <MovieGrid movies={shown} onSelect={onSelect} />}
      {failure && (
        <StatusMessage kind="error" onRetry={retry} retryAfter={failure.err.retryAfter}>
          {failure.err.message}
        </StatusMessage>
      )}
      {!loading && !failure && shown.length === 0 && (
        <StatusMessage
          kind="empty"
          onRetry={hasFilters ? reset : undefined}
          actionLabel={otherFilters ? 'Quitar filtros' : 'Limpiar búsqueda'}
        >
          {emptyText}
        </StatusMessage>
      )}
      {!loading && !failure && canLoadMore && (
        <button type="button" className="btn btn--outline more" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Cargando…' : 'Cargar más películas'}
        </button>
      )}
    </main>
  );
}
