import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies }) {
  return (
    <section className="grid">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </section>
  );
}
