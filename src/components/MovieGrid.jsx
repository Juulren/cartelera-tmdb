import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, onSelect }) {
  return (
    <section className="grid">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} onSelect={onSelect} />
      ))}
    </section>
  );
}
