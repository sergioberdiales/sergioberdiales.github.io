# Generador de chistes de Mila

Página estática preparada para https://sergioberdiales.github.io/mila/.

## Archivos y decisiones

- `index.html`: página independiente, sin front matter de Jekyll ni estilos del tema.
- `styles.css`: foto completa, bocadillo sobre el portátil en escritorio y debajo en móvil; foco visible y movimiento reducido.
- `chistes.js`: los 50 textos y la despedida del JSON original, sin cambios. Se incluye como script clásico para funcionar también con `file://`, sin fetch, red ni compilación.
- `script.js`: Fisher–Yates, ronda sin repeticiones y pausa de 550 ms con bloqueo de pulsaciones. Después de los 50 chistes, la siguiente pulsación muestra la despedida y desactiva la acción conservando el foco.
- `assets/mila.jpg`: fotografía original, sin alteraciones (271.259 bytes).
- `_tests/browser.cjs`: prueba automatizada con Playwright, excluida de la publicación por la convención de carpetas con guion bajo de Jekyll.

No se cambian `_config.yml`, el tema, las otras páginas ni los workflows. Los defaults existentes solo se aplican a posts y `/mila/` no está excluido. El despliegue actual de Pages se realiza desde `main`; fusionar el PR, tras revisarlo, incorporará esta ruta al sitio.

## Vista local

Abrir `mila/index.html` directamente o ejecutar desde la raíz:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visitar http://127.0.0.1:8765/mila/.

## Validación

Con Playwright instalado en el entorno de pruebas y Chromium disponible:

```sh
node mila/_tests/browser.cjs
```

Se puede configurar `CHROME_PATH` con el ejecutable de Chrome y `MILA_URL` con otra URL, incluso `file://`. No se necesitan dependencias para usar la web.

Comprobaciones realizadas: Chrome de escritorio con viewports de 320, 390, 700, 701, 768, 1024 y 1440 px; todos los textos sin desbordamiento; ronda completa de 50 chistes únicos; despedida en la siguiente pulsación; diez clics simultáneos por paso; espera de 550 ms; bloqueo final; recarga; teclado y conservación del foco; movimiento reducido; imagen cargada y ausencia de errores JavaScript. Capturas revisadas visualmente a 390 y 1440 px. Textos y fotografía cotejados con el ZIP original. La emulación de tamaño no sustituye pruebas en dispositivos físicos ni una prueba de lector de pantalla. No se ha ejecutado la compilación completa del sitio Jekyll.
