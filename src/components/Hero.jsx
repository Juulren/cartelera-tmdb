import { IMG_BASE } from '../api/movies.js';
import { genreName } from '../genres.js';

// Portada de la película destacada, con su imagen de fondo.
export default function Hero({ movie, onSelect }) {
  const year = movie.release_date?.slice(0, 4);
  const meta = [year, genreName(movie.genre_ids)].filter(Boolean).join(' · ');

  return (
    <section className="hero" aria-label="Película destacada">
      <img className="hero__img" src={`${IMG_BASE}/w1280${movie.backdrop_path}`} alt="" />
      <div className="hero__content">
        <h2 className="hero__title">{movie.title}</h2>
        <p className="hero__meta">
          {movie.vote_average > 0 && <span className="star">★ {movie.vote_average.toFixed(1)}</span>}
          {meta && <span>{meta}</span>}
        </p>
        {movie.overview && <p className="hero__overview">{movie.overview}</p>}
        <button type="button" className="btn" onClick={() => onSelect(movie.id)}>
          Ver detalles
        </button>
      </div>
    </section>
  );
}
