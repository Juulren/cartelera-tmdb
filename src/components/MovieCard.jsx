import { IMG_BASE } from '../api/movies.js';

export default function MovieCard({ movie, onSelect }) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <button type="button" className="card" onClick={() => onSelect(movie.id)}>
      {movie.poster_path ? (
        <img
          src={`${IMG_BASE}/w342${movie.poster_path}`}
          alt={`Póster de ${movie.title}`}
          loading="lazy"
        />
      ) : (
        <div className="card__noposter">Sin póster</div>
      )}
      <div className="card__info">
        <h2>{movie.title}</h2>
        <p>
          {year || 'Sin fecha'} · ★ {movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
        </p>
      </div>
    </button>
  );
}
