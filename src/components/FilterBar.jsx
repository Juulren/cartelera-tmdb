import { GENRE_LIST } from '../genres.js';
import SearchBar from './SearchBar.jsx';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 1 - 1930 + 1 }, (_, i) => THIS_YEAR + 1 - i);

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Más populares' },
  { value: 'vote_average.desc', label: 'Mejor calificadas' },
  { value: 'primary_release_date.desc', label: 'Más recientes' },
  { value: 'primary_release_date.asc', label: 'Más antiguas' },
];

const RATINGS = [
  { value: '', label: 'Cualquiera' },
  { value: '5', label: '5 o más' },
  { value: '6', label: '6 o más' },
  { value: '7', label: '7 o más' },
  { value: '8', label: '8 o más' },
];

export default function FilterBar({ filters, onChange, onReset, activeCount }) {
  function toggleGenre(id) {
    const genres = filters.genres.includes(id)
      ? filters.genres.filter((g) => g !== id)
      : [...filters.genres, id];
    onChange({ genres });
  }

  return (
    <div className="filters" role="search" aria-label="Buscar y filtrar películas">
      <SearchBar value={filters.text} onChange={(text) => onChange({ text })} />

      <div className="filters__row">
        <label>
          Año
          <select value={filters.year} onChange={(e) => onChange({ year: e.target.value })}>
            <option value="">Cualquiera</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label>
          Calificación
          <select value={filters.minRating} onChange={(e) => onChange({ minRating: e.target.value })}>
            {RATINGS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ordenar por
          <select value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="chips">
        <legend>Géneros (la película debe tener todos los elegidos)</legend>
        {GENRE_LIST.map((g) => {
          const on = filters.genres.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              className={`chip${on ? ' chip--on' : ''}`}
              aria-pressed={on}
              onClick={() => toggleGenre(g.id)}
            >
              {g.name}
            </button>
          );
        })}
      </fieldset>

      {activeCount > 0 && (
        <button type="button" className="filters__reset" onClick={onReset}>
          Quitar filtros ({activeCount})
        </button>
      )}
    </div>
  );
}
