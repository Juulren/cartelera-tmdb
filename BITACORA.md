# Bitácora de programación con IA

Proyecto Cartelera · Tarea 2: aplicación con IA que usa una API

- **Repositorio:** https://github.com/Juulren/cartelera-tmdb
- **Cuenta de GitHub:** Juulren
- **API externa:** TMDB (The Movie Database), plan gratuito
- **Herramienta de IA:** Claude Code (modelos Claude de Anthropic)
- **Fecha:** 29 de octubre de 2026

Versión en Word con la declaración de IA, las instrucciones y las capturas: [`docs/Bitacora-IA-Cartelera.docx`](docs/Bitacora-IA-Cartelera.docx).

## 1. Prompts reales que usé

### Prompt 1 · Planear la tarea

```text
vamos a hacer un plan de implementación para lo pedido en el archivo adjunto,
```

**Respuesta de la IA:** Intentó leer el PDF, falló porque faltaba pdftoppm y lo resolvió con pdftotext. Me hizo tres preguntas (API, stack y alcance) y propuso un plan: React + Vite con un proxy Express para esconder la API key, manejo de errores y una secuencia de commits.

**¿Funcionó a la primera?** Sí, el plan se aprobó sin cambios.

**Qué corregí o ajusté:** Elegí yo TMDB, React + Vite y qué partes incluir (app, README, bitácora y commits).

### Prompt 2 · Subir el trabajo a GitHub

```text
https://github.com/Juulren/cartelera-tmdb.git
tu sube lo que tenemos y los cambios proximos
```

**Respuesta de la IA:** Conectó el remoto, hizo los commits por etapas y los subió. Como git no tenía nombre ni correo, usó el correo noreply de mi perfil de GitHub, guardado solo en este repositorio.

**¿Funcionó a la primera?** Sí, a la primera. El historial quedó progresivo.

**Qué corregí o ajusté:** Los commits llevan la línea Co-Authored-By: Claude; la dejé a propósito, es parte de declarar el uso de IA.

### Prompt 3 · Mejorar el diseño

```text
haz mejor el frontend, está demasiado simple y sin vida
```

**Respuesta de la IA:** Propuso una identidad de cine (rojo de telón, tipografía Bricolage Grotesque) y rehízo la interfaz: portada con la imagen de la película más popular, esqueletos de carga, sinopsis al pasar el cursor y anillo de calificación en el detalle. Lo revisó en tema claro, oscuro y móvil.

**¿Funcionó a la primera?** En su mayoría. El modal mostraba un contorno rojo raro.

**Qué corregí o ajusté:** Era el anillo de foco del contenedor del diálogo; se quitó solo de ahí y se conservó en los botones. Bash también rechazó comandos largos y hubo que escribir el CSS en partes.

### Prompt 4 · Un error de "Cargar más" que no se reproducía

```text
el cargar más peliculas me da error de servidor
```

**Respuesta de la IA:** No pudo reproducirlo: "Cargar más" funcionó cinco veces seguidas en sus pruebas. Por precaución agregó un reintento en el proxy ante fallos de TMDB y registro de la causa, y me pidió reiniciar el servidor y pegar el log.

**¿Funcionó a la primera?** No. Fue un arreglo preventivo; no era la causa real.

**Qué corregí o ajusté:** Tuve que dar más información (siguiente prompt). Un síntoma vago produce un arreglo a ciegas.

### Prompt 5 · Pegar el mensaje exacto del error

```text
No se pudo contactar al servidor.
```

**Respuesta de la IA:** Con ese texto vio que no era un error del código sino el caso "sin respuesta": el navegador no llegó al servidor. Concluyó que el servidor de desarrollo no estaba corriendo y me indicó arrancar npm run dev y revisar las líneas [web] y [api].

**¿Funcionó a la primera?** Sí, en un solo intercambio.

**Qué corregí o ajusté:** Arranqué npm run dev y la app volvió a funcionar. El mensaje exacto permitió el diagnóstico.

### Prompt 6 · Separar Populares y Catálogo con filtros

```text
ya está funcionando, sin embargo, todos están en la misma sesion de "populares" en populares solo debe de haber unos cuantos y en otra pestaña debe estar ya el catalogo completo con un search bar avanzado con filtros
```

**Respuesta de la IA:** Dividió la app en dos pestañas: Populares (portada y 11 películas) y Catálogo, con búsqueda y filtros por género (varios a la vez), año, calificación y orden. Para filtrar sobre todo el catálogo agregó la ruta /api/discover al proxy, que usa /discover/movie de TMDB.

**¿Funcionó a la primera?** Sí. La lógica funcionó en las pruebas; dos detalles se pulieron después.

**Qué corregí o ajusté:** Mostraba "20.001 películas" (tope engañoso de TMDB) y se cambió por "Más de 10,000"; se mejoraron los mensajes de resultado vacío. Con texto, TMDB no filtra ni ordena, así que esos filtros se aplican sobre lo ya cargado y la app lo avisa.

## 2. Errores de la IA que detecté

### El proxy se abría en el puerto equivocado y fingía que arrancó

Síntoma: la lista mostraba "Error 500". El servidor leía la variable PORT, que el entorno de pruebas tenía en 5173; el proxy intentó abrirse en el puerto de Vite y el frontend no lo encontraba en el 3001. Además, el log decía "API proxy en http://localhost:5173" aunque no funcionaba: en Express 5 el callback de listen recibe el error y el código lo ignoraba.

Solución: variable propia API_PORT (3001 por defecto) y manejar el evento error de listen para avisar y salir (commit ed10e95).

### Un servidor viejo seguía vivo y daba respuestas engañosas

Una prueba de la IA dejó un servidor vivo en el puerto 3001 (en Git Bash, kill no detuvo el proceso de Windows). Ese servidor respondía "no hay API key" aunque el .env estaba bien, y luego dio 404 en la ruta nueva /api/discover.

Solución: identificar qué proceso escuchaba en el puerto antes de actuar. El de la IA se cerró por su PID; el mío (mi npm run dev anterior) no se tocó. Probé en otro puerto (3002) y reinicié mi servidor.

## 3. Qué aprendí y qué haría distinto

### Lo que aprendí

- Probar cada etapa antes del commit: casi todos los errores aparecieron al probar en el navegador, no al leer el código.
- Un log que dice "arrancó" no prueba que arrancó; hay que comprobar la respuesta real.
- Los servidores de desarrollo no recargan el backend: tras cambiar el proxy hay que reiniciar npm run dev; un proceso viejo en un puerto causa errores confusos.
- Copiar el mensaje exacto del error permitió diagnosticar en un solo intercambio; "me da error de servidor" no.
- La API key no puede ir en el código del navegador: por eso hay un proxy y la key vive solo en .env (en .gitignore).

### Qué haría distinto la próxima vez

- Dar al inicio las restricciones (no subir keys, cómo quiero los commits) y pedir que me explique cada archivo, para poder explicar cualquier línea en la demo.
- Describir el síntoma con el mensaje exacto, pedir cambios más pequeños por etapa y probar errores reales (corte de red, límite de peticiones), no solo simulados.
