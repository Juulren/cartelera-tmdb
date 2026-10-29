# Bitácora de programación con IA

Proyecto: **Cartelera** (React + Vite + proxy Express + API de TMDB).
Herramienta principal: Claude Code.

> **BORRADOR — revísalo y hazlo tuyo antes de entregar.** Los prompts de abajo son los
> que escribiste de verdad en la sesión (copiados tal cual) y los hechos descritos
> ocurrieron así, pero la valoración ("funcionó / no funcionó") y lo aprendido deben
> ser tuyos. Si usaste otras herramientas o hiciste otros prompts, agrégalos.
> Borra este bloque al terminar. Largo objetivo: 1 a 2 páginas.

## Prompts reales

### 1. Planear la tarea
**Prompt:** `vamos a hacer un plan de implementación para lo pedido en el archivo adjunto,`
**Respuesta de la IA:** leyó el PDF de la tarea, me hizo 3 preguntas (API, stack y alcance) y propuso un plan: React + Vite con un proxy Express para esconder la key, tabla de manejo de errores, estructura de archivos y secuencia de commits.
**¿Funcionó a la primera?** Sí, el plan se aprobó sin cambios.
**Qué ajusté:** elegí TMDB y React + Vite entre las opciones que me dio.

### 2. Dónde van los commits
**Prompt:** `y el repositorio donde vas a hacer todos los commits?`
**Respuesta de la IA:** explicó que era un repo local sin remoto y que yo debía crear uno vacío en GitHub y conectarlo.
**¿Funcionó a la primera?** Sí.
**Qué ajusté:** le pasé la URL de mi repo y le pedí que subiera todo.

### 3. Obtener la key de TMDB
**Prompt:** `todavia lo estoy haciendo, me pide url, que le pongo?`
**Respuesta de la IA:** me dijo que poniera la URL del repositorio, qué tipo de uso elegir y que pegara la key solo en `.env`.
**¿Funcionó a la primera?** <!-- COMPLETA: ¿TMDB aceptó esa URL? -->
**Qué ajusté:** <!-- COMPLETA -->

### 4. Manejo de errores
**Prompt:** `Errores primero`
**Respuesta de la IA:** creó errores tipificados (`ApiError`), banner sin conexión con reintento automático, cuenta regresiva para el límite de peticiones y probó cada caso en el navegador forzando respuestas de `fetch`.
**¿Funcionó a la primera?** Casi: en una prueba la recuperación automática no se activó, y la IA descubrió que era un fallo de su propia prueba (no había simulado primero estar sin conexión). También corrigió el texto del banner, que decía algo falso cuando no había nada cargado.
**Qué ajusté:** <!-- COMPLETA: qué revisaste tú -->

### 5. Modal de detalle
**Prompt:** `Sí, modal`
**Respuesta de la IA:** agregó `getMovie`, el componente `MovieDetail` (Esc, clic fuera, ×, foco y scroll) y volvió botones a las tarjetas.
**¿Funcionó a la primera?** Sí, pasó las pruebas en el navegador.
**Qué ajusté:** <!-- COMPLETA -->

<!-- Si prefieres prompts más sustanciosos, agrega los tuyos aquí con el mismo formato.
     Piden "al menos 5 prompts reales, copiados tal cual". -->

## Un error de la IA que detecté

**El proxy se abría en el puerto equivocado y fingía que todo iba bien.**

- **Síntoma:** al probar la app, la lista mostraba `Error 500`.
- **Causa 1:** el servidor leía `process.env.PORT`; el entorno de pruebas tenía esa variable definida con el valor 5173, así que el proxy intentó abrirse en el mismo puerto que Vite y el frontend no lo encontraba en 3001.
- **Causa 2:** el log decía "API proxy en http://localhost:5173" aunque no estaba funcionando, porque en Express 5 el callback de `listen` recibe el error como argumento y el código lo ignoraba.
- **Otro hallazgo:** un servidor de una prueba anterior seguía vivo en el puerto 3001 y respondía "no hay API key" aunque el `.env` ya estaba bien. Lo identifiqué por el puerto y cerré solo ese proceso.
- **Solución:** variable propia `API_PORT` (3001 por defecto) y manejar el evento `error` de `listen` para avisar y salir (commit `ed10e95`).

<!-- COMPLETA: cómo lo notaste tú y qué te sorprendió. -->

## Qué aprendí y qué haría distinto

<!-- COMPLETA con tus palabras. Ideas, solo si son ciertas para ti:
- Pedir a la IA que pruebe cada etapa antes de hacer commit evitó llevar errores al repo.
- Una variable de entorno con nombre genérico (PORT) puede chocar con otras herramientas.
- Un log de "arrancó" no prueba que arrancó: hay que probar la respuesta real.
- La próxima vez: pasar al inicio el PDF completo y las restricciones (no subir keys),
  pedir commits más pequeños, y revisar yo cada archivo antes de aceptarlo para poder
  explicar cualquier línea. -->
