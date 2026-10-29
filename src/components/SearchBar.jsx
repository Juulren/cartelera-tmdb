export default function SearchBar({ value, onChange }) {
  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="q" className="sr-only">
        Buscar película
      </label>
      <input
        id="q"
        type="search"
        placeholder="Buscar película…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
    </form>
  );
}
