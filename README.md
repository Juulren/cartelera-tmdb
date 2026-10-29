# Cartelera

Aplicación web pequeña para explorar películas con la API de [TMDB](https://www.themoviedb.org/): muestra las populares, permite buscar por título, cargar más resultados y ver el detalle de cada película (póster, sinopsis, géneros, duración y calificación). Todo en español (`es-MX`).

Proyecto de la **Tarea 2** (consumo de una API externa).

## Tecnologías

- **Frontend:** React 18 + Vite
- **Backend:** un proxy mínimo con Express (Node) que habla con TMDB
- **API externa:** TMDB v3

## Requisitos

- [Node.js](https://nodejs.org/) **22.9 o superior** (el servidor usa `--env-file-if-exists`)
- Una cuenta gratuita en TMDB y su API key

## Cómo ejecutarla

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone https://github.com/Juulren/cartelera-tmdb.git
   cd cartelera-tmdb
   npm install
   ```

2. Consigue tu clave en [themoviedb.org](https://www.themoviedb.org/settings/api) (*Settings → API*). Sirven la **API Key** (v3) o el **API Read Access Token** (v4, empieza con `eyJ`).

3. Crea tu archivo `.env` a partir de la plantilla y pega la clave:

   ```bash
   cp .env.example .env
   ```

   ```
   TMDB_API_KEY=tu_clave_aqui
   ```

4. Arranca todo con un solo comando:

   ```bash
   npm run dev
   ```

5. Abre <http://localhost:5173>.

Otros comandos: `npm run build` (compila el frontend a `dist/`), `npm run server` (solo el proxy).

## Cómo se protege la API key

La clave **nunca llega al navegador ni al repositorio**:

- Vive solo en `.env`, que está en `.gitignore`. En el repo solo hay `.env.example` con un valor falso.
- El navegador llama a `/api/...` (nuestro proxy en `server/index.js`) y es el servidor quien agrega la clave al hablar con TMDB.
- No se usa ninguna variable `VITE_*`, porque Vite las incrusta en el código que se descarga el navegador.

El proxy escucha en el puerto 3001 (`API_PORT` lo cambia) y Vite reenvía `/api` hacia él en desarrollo.

## Manejo de errores

| Situación | Qué ve el usuario |
|---|---|
| Sin conexión | Banner "Sin conexión" y reintento automático al volver la red |
| Respuesta vacía | "No se encontraron películas para «…»" |
| Límite de peticiones (429) | Mensaje con cuenta regresiva; Reintentar se activa al terminar |
| Key inválida o ausente | Mensaje que indica revisar el `.env` |
| Timeout (8 s) o servidor caído | "El servicio no está respondiendo" y botón Reintentar |

Si el usuario escribe rápido, las peticiones anteriores se cancelan para que no lleguen resultados viejos.

## Estructura

```
server/index.js          Proxy Express: /api/popular, /api/search, /api/movie/:id
src/api/movies.js        Cliente de la API, timeout y errores tipificados (ApiError)
src/hooks.js             useDebounce, useOnlineStatus, useCountdown
src/components/          SearchBar, MovieGrid, MovieCard, MovieDetail (modal), StatusMessage
src/App.jsx              Estado principal: búsqueda, paginación y errores
```

## Declaración de uso de IA

> Se permite y se espera el uso de IA, siempre que se declare.

### Herramientas y para qué las usé

| Herramienta | Para qué la usé |
|---|---|
| Claude Code (modelos Claude de Anthropic) | Planear la arquitectura, generar el código del proxy y de los componentes, depurar errores (por ejemplo, el conflicto con la variable `PORT`), probar la app en el navegador y redactar este README |

<!-- COMPLETA: agrega aquí cualquier otra herramienta que hayas usado de verdad
     (ChatGPT, Copilot, Cursor, Codespaces…) y para qué. Borra este comentario. -->

### Qué hice yo sin ayuda de IA

<!-- COMPLETA con lo que sea cierto, por ejemplo: crear la cuenta de TMDB y obtener la
     key, crear el repositorio, hacer las pruebas manuales, grabar la demo.
     Recuerda: debes poder explicar cualquier línea del código. Borra este comentario. -->

Los detalles de los prompts, los errores de la IA y lo aprendido están en [`BITACORA.md`](BITACORA.md).

## Créditos

Este producto usa la API de TMDB pero no está respaldado ni certificado por TMDB. Los datos y las imágenes de películas pertenecen a [The Movie Database (TMDB)](https://www.themoviedb.org/).
