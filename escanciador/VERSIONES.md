# Evolución del juego

Cada versión funcional se conserva en un commit de Git y una etiqueta `v0.N.0`.
Este registro describe los cambios y las comprobaciones de cada versión.
Las versiones se guardan localmente en este proyecto.

## v0.2.0 — Brazo articulado y audio provisional

- Brazo del vaso con hombro fijo y segmentos de 78 y 83 unidades, resueltos mediante IK de dos huesos. El brazo levantado también conserva sus longitudes.
- Vaso limitado horizontalmente a 210–276,1 unidades de un lienzo lógico de 400; altura fija de 368. El extremo derecho se calcula a partir del alcance de la mano, dejando margen antes de estirar por completo el codo.
- Botella más pequeña, sujeta por la mano; gafas oscuras y mangas remangadas.
- Web Audio: ruido filtrado durante el vertido, timbre distinto al acertar, gotas al suelo y confirmación final. Se desbloquea desde el primer gesto.
- Se conserva la pantalla y el control con un dedo.
- Comprobado: arrastre en navegador, pantalla de 390 × 844, AudioContext en estado `running` tras el primer gesto, sin errores de consola. Falta valorar el sonido de oído en un móvil real.
- `node tests/mechanics.cjs`: longitudes constantes, límites, colisiones dentro/fuera, conservación de las 600 gotas en tres partidas completas y parada al soltar.

### Puntos de sustitución

- Sonidos: objeto `sound` en `game.js`, métodos `unlock`, `pour`, `splash` y `finish`.
- Arte: `drawFelix`, `drawBottle` y `drawGlass`; conservar los anclajes del hombro, mano, boca de botella y borde del vaso.
- Colisión: cada gota se evalúa una sola vez al cruzar la altura del borde del vaso. Se interpola su posición horizontal y se compara con la abertura interior de 40 unidades.

## v0.1.0 — Prototipo inicial

- Pantalla vertical con Félix, botella, vaso y chorro.
- Arrastrar el vaso y mantener pulsado para escanciar.
- Reparto de sidra dentro/fuera y botón «Otro culín».
- Imagen de referencia de Félix incluida en el proyecto.
- Pendiente: corregir el estiramiento del brazo e incorporar audio.

Para consultar las versiones: `git log --oneline --decorate` y `git tag`.
Para exportar una versión sin alterar el trabajo actual:
`git archive --format=zip --output=/tmp/escanciador-v0.1.0.zip v0.1.0`.

## Publicación de la segunda versión

- Sitio: https://sergioberdiales.github.io/escanciador/
- La raíz abre la segunda versión; `/v1/` conserva la primera y `/v2/` la segunda.
- `bash scripts/build-site.sh` prepara los archivos de publicación y extrae las copias históricas desde sus etiquetas Git.
- Alojamiento público: GitHub Pages, repositorio `sergioberdiales/sergioberdiales.github.io`, carpeta `escanciador/`.
- La copia de ChatGPT Sites se creó por error; no es el destino de publicación del proyecto.

## v0.3.0 — Recuperación del sonido

- Reintenta desbloquear Web Audio al levantar el dedo (`pointerup` y `touchend`), además del inicio del gesto.
- Recupera contextos suspendidos, interrumpidos o cerrados. Solicita sesión de reproducción donde existe AudioSession.
- Añade «Probar sonido», con confirmación breve y opción de reintento si falla la activación.
- Sube ligeramente el volumen del chorro y versiona las URLs de JavaScript y CSS para evitar mezclas con archivos en caché.
- Publicación principal y copia `/v3/`; `/v1/` y `/v2/` permanecen intactas.
- Comprobado: pruebas de mecánica y de audio, activación real mediante clic en navegador (`running`), sin errores de consola. Pendiente de confirmar audición en el dispositivo del usuario.
- Referencias: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state y https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation

## v0.4.0 — Codo hacia el cuerpo y ciclos de audio

- Invierte la solución IK del brazo del vaso: el codo queda hacia el cuerpo y la mano hacia fuera, con las mismas longitudes y límites.
- Cada pulsación crea una fuente nueva para el chorro; al soltar se detiene y desconecta. No se mantiene un bucle silencioso permanente.
- Los cambios de volumen y timbre se programan solo al cambiar el estado, en lugar de cada fotograma.
- Al regresar tras pérdida de foco, el siguiente gesto reconstruye el contexto. «Probar sonido» también reconstruye la salida antes de reproducir la confirmación.
- Un desbloqueo tardío no vuelve a arrancar el chorro si ya se ha soltado el vaso.
- Pruebas: 30 ciclos de audio, vuelta tras interrupción, recuperación de contexto y longitudes/orientación del codo en todo el recorrido.
- No se ha podido revisar visualmente en navegador porque el Mac está bloqueado. La audición en el móvil del usuario sigue pendiente de confirmación.
- Publicación: raíz y `/v4/`; las versiones anteriores permanecen intactas.
