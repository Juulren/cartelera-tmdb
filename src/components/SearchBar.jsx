export default function SearchBar({ value, onChange }) {
  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="q" className="sr-only">
        Buscar película
      </label>
      <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        id="q"
        type="search"
        placeholder="Busca una película por título"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </form>
  );
}
