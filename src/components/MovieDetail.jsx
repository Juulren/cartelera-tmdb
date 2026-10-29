import { useEffect, useRef, useState } from 'react';
import { getMovie, IMG_BASE } from '../api/movies.js';
import StatusMessage from './StatusMessage.jsx';

function formatRuntime(min) {
  if (!min) return null;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

export default function MovieDetail({ id, onClose }) {
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const dialogRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setMovie(null);
    setError(null);
    getMovie(id, controller.signal)
      .then(setMovie)
      .catch((err) => {
        if (!controller.signal.aborted) setError(err);
      });
    return () => controller.abort();
  }, [id, attempt]);

  // Al abrir: bloquear el scroll de fondo y mover el foco al diálogo; al cerrar, devolverlo.
  useEffect(() => {
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  // Esc cierra; Tab se queda dentro del diálogo.
  function onKeyDown(e) {
    if (e.key === 'Escape') return onClose();
    if (e.key !== 'Tab') return;
    const items = dialogRef.current.querySelectorAll('button, [href], input, [tabindex="0"]');
    if (!items.length) return e.preventDefault();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const year = movie?.release_date?.slice(0, 4);
  const meta = movie ? [year, formatRuntime(movie.runtime)].filter(Boolean).join(' · ') : '';

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={movie?.title ?? 'Detalle de la película'}
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        {!movie && !error && <StatusMessage kind="loading">Cargando detalle…</StatusMessage>}
        {error && (
          <StatusMessage
            kind="error"
            onRetry={() => setAttempt((n) => n + 1)}
            retryAfter={error.retryAfter}
          >
            {error.message}
          </StatusMessage>
        )}

        {movie && (
          <>
            {movie.backdrop_path && (
              <div className="detail__backdrop">
                <img src={`${IMG_BASE}/w780${movie.backdrop_path}`} alt="" />
              </div>
            )}
            <div className="detail">
              {movie.poster_path ? (
                <img
                  className="detail__poster"
                  src={`${IMG_BASE}/w500${movie.poster_path}`}
                  alt={`Póster de ${movie.title}`}
                />
              ) : (
                <div className="card__noposter detail__poster">Sin póster</div>
              )}
              <div className="detail__body">
                <h2>{movie.title}</h2>
                {movie.tagline && <p className="detail__tagline">{movie.tagline}</p>}
                <div className="detail__facts">
                  {movie.vote_average > 0 && (
                    <div
                      className="ring"
                      style={{ '--pct': `${movie.vote_average * 10}%` }}
                      role="img"
                      aria-label={`Calificación ${movie.vote_average.toFixed(1)} de 10`}
                    >
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  <p>{meta}</p>
                </div>
                {movie.genres?.length > 0 && (
                  <ul className="tags">
                    {movie.genres.map((g) => (
                      <li key={g.id}>{g.name}</li>
                    ))}
                  </ul>
                )}
                <p className="detail__overview">
                  {movie.overview || 'Esta película aún no tiene sinopsis en español.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
