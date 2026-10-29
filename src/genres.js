// Géneros de TMDB (es). Las listas de películas solo traen los ids.
export const GENRES = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia ficción',
  10770: 'Película de TV',
  53: 'Suspenso',
  10752: 'Bélica',
  37: 'Western',
};

export const genreName = (ids = []) => GENRES[ids[0]] ?? null;
