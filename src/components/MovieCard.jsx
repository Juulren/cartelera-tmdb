import { IMG_BASE } from '../api/movies.js';
import { genreName } from '../genres.js';

export default function MovieCard({ movie, onSelect }) {
  const year = movie.release_date?.slice(0, 4);
  const sub = [year, genreName(movie.genre_ids)].filter(Boolean).join(' · ');

  return (
    <button type="button" className="card" onClick={() => onSelect(movie.id)}>
      <div className="card__poster">
        {movie.poster_path ? (
          <img
            src={`${IMG_BASE}/w342${movie.poster_path}`}
            alt={`Póster de ${movie.title}`}
            loading="lazy"
          />
        ) : (
          <div className="card__noposter">Sin póster</div>
        )}
        {movie.vote_average > 0 && (
          <span className="card__rating">★ {movie.vote_average.toFixed(1)}</span>
        )}
        <span className="card__peek">{movie.overview || 'Sin sinopsis disponible.'}</span>
      </div>
      <div className="card__info">
        <h3>{movie.title}</h3>
        {sub && <p>{sub}</p>}
      </div>
    </button>
  );
}
