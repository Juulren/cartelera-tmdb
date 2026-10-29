// Marcadores de posición mientras cargan las películas.
export default function SkeletonGrid({ count = 12 }) {
  return (
    <section className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton" key={i}>
          <div className="skeleton__poster" />
          <div className="skeleton__line" />
          <div className="skeleton__line skeleton__line--short" />
        </div>
      ))}
    </section>
  );
}
