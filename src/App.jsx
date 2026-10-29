import { useCallback, useEffect, useState } from 'react';
import { getPopular } from './api/movies.js';
import MovieGrid from './components/MovieGrid.jsx';
import StatusMessage from './components/StatusMessage.jsx';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPopular(1);
      setMovies(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="app">
      <header>
        <h1>Cartelera</h1>
        <p>Películas populares de TMDB</p>
      </header>

      {loading && <StatusMessage kind="loading">Cargando películas…</StatusMessage>}
      {error && (
        <StatusMessage kind="error" onRetry={load}>
          {error}
        </StatusMessage>
      )}
      {!loading && !error && <MovieGrid movies={movies} />}
    </main>
  );
}
