import { getPopular } from '../api/movies.js';
import { usePagedMovies } from '../usePagedMovies.js';
import Hero from '../components/Hero.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

// Cuántas películas se muestran además de la destacada: esta sección es solo una selección.
const SHOWN = 11;

export default function PopularView({ onSelect }) {
  const { movies, loading, failure, retry } = usePagedMovies(getPopular);

  // La portada destaca la primera película con imagen de fondo; no se repite en la rejilla.
  const featured = !failure ? movies.find((m) => m.backdrop_path) : null;
  const rest = movies.filter((m) => m.id !== featured?.id).slice(0, SHOWN);

  return (
    <>
      {loading && <div className="hero hero--skeleton" aria-hidden="true" />}
      {!loading && featured && <Hero movie={featured} onSelect={onSelect} />}

      <main className="app">
        <h2 className="section-title">Populares ahora</h2>

        {loading && <SkeletonGrid count={SHOWN} />}
        {!loading && rest.length > 0 && <MovieGrid movies={rest} onSelect={onSelect} />}
        {failure && (
          <StatusMessage kind="error" onRetry={retry} retryAfter={failure.err.retryAfter}>
            {failure.err.message}
          </StatusMessage>
        )}
        {!loading && !failure && (
          <div className="cta">
            <p>¿Buscas otra cosa? El catálogo completo tiene filtros por género, año y calificación.</p>
            <a className="btn" href="#catalogo">
              Ver el catálogo completo
            </a>
          </div>
        )}
      </main>
    </>
  );
}
