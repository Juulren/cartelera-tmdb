import { useEffect, useState } from 'react';
import { useOnlineStatus } from './hooks.js';
import MovieDetail from './components/MovieDetail.jsx';
import PopularView from './views/PopularView.jsx';
import CatalogView from './views/CatalogView.jsx';

// La sección activa vive en el hash de la URL (#catalogo), así funcionan atrás/adelante y los enlaces.
const readView = () => (window.location.hash === '#catalogo' ? 'catalogo' : 'populares');

function useView() {
  const [view, setView] = useState(readView);

  useEffect(() => {
    const onChange = () => {
      setView(readView());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return view;
}

export default function App() {
  const online = useOnlineStatus();
  const view = useView();
  const [selectedId, setSelectedId] = useState(null);
  // El catálogo no se carga hasta la primera visita; después se conserva (con sus filtros).
  const [catalogVisited, setCatalogVisited] = useState(view === 'catalogo');

  useEffect(() => {
    if (view === 'catalogo') setCatalogVisited(true);
  }, [view]);

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <h1 className="brand">Cartelera</h1>
          <nav className="tabs" aria-label="Secciones">
            <a href="#populares" aria-current={view === 'populares' ? 'page' : undefined}>
              Populares
            </a>
            <a href="#catalogo" aria-current={view === 'catalogo' ? 'page' : undefined}>
              Catálogo
            </a>
          </nav>
        </div>
      </header>

      {!online && (
        <div className="banner" role="alert">
          Sin conexión. Se reintentará solo cuando vuelva la red.
        </div>
      )}

      <div hidden={view !== 'populares'}>
        <PopularView onSelect={setSelectedId} />
      </div>
      {catalogVisited && (
        <div hidden={view !== 'catalogo'}>
          <CatalogView onSelect={setSelectedId} />
        </div>
      )}

      <footer className="footer">
        <p>
          Datos e imágenes de{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            The Movie Database (TMDB)
          </a>
          . Esta app no está respaldada ni certificada por TMDB.
        </p>
      </footer>

      {selectedId && <MovieDetail id={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}
