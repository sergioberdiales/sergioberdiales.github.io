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

## v0.6.0 — Brazo abierto hacia la derecha

- El hombro, el codo y la mano quedan ordenados de izquierda a derecha en todo el recorrido. El brazo superior ya no cruza hacia el cuerpo.
- Dos segmentos fijos de 90 unidades; vaso a altura 350 y recorrido aproximado 270–317 en un lienzo lógico de 400. El límite izquierdo también se calcula con un ángulo mínimo de apertura de 6 grados.
- Posición inicial del vaso en 290; trayectoria del chorro ajustada al nuevo alcance.
- Comprobado: longitudes constantes y ambos segmentos hacia la derecha en todo el recorrido; tres culines conservan las 600 gotas y permiten aciertos y fallos; pruebas de audio pasan sin cambios en su funcionamiento.
- Revisión visual en navegador no disponible: Mac bloqueado.
- Publicación en raíz y `/v6/`; versiones anteriores intactas.

Nota de historial: la etiqueta local v0.5.0 se creó por error antes del commit, tras fallar el guardado por permisos, y apunta a v0.4.0. Se conserva sin sobrescribir; la siguiente versión funcional es v0.6.0.

## v0.7.0 — Un culín de cultura

- Al terminar de escanciar aparece una pregunta de cultura asturiana con cuatro opciones y una única respuesta.
- Seis preguntas contrastadas sobre capital, Día de Asturias, fabada, Gascona, oricios y escanciado; fuente enlazada al responder. Rotan sin repetirse hasta agotar la tanda.
- Después se muestran sidra recogida y desperdiciada, acierto o fallo, explicación y una de doce frases de Félix según el porcentaje (menos de 40%, de 40 a 74%, desde 75%) y la respuesta.
- Reinicio mediante «Otro culín». Tarjeta desplazable en pantallas cortas y botones de al menos 44 px.
- Corregido redondeo del marcador final para que ambos porcentajes sumen 100%.
- Pruebas de mecánica, audio, todas las respuestas, bloqueo de doble respuesta, rotación, comentarios y reinicio. Revisión de pregunta y resultado en navegador mediante ronda simulada y clic real en respuesta y reinicio.
- Publicación en raíz y `/v7/`, conservando versiones anteriores.

## v0.8.0 — Más puntería y más cultura

- Retirada la oreja circular y su detalle interior.
- Activación inicial mediante «Empezar con sonido»: clic nativo antes de escanciar, confirmación breve y opción de reintentar o jugar sin audio si el navegador lo bloquea. El arrastre y el teclado no consumen sidra antes de empezar.
- Vaso de 28 unidades de ancho (antes 48), con abertura visible coherente con la colisión. Balanceo más rápido y fase aleatoria por culín; trayectoria calculada para permanecer alcanzable.
- Prueba de dificultad en cuatro fases: mejor posición inmóvil 68%; seguimiento preciso simulado 100%. No hay fallos impuestos.
- Ocho preguntas nuevas: Silo, Valdediós, Tito Bustillo, Os Teixóis, batán, cabo de Peñas, Llastres y Alejandro Casona. Fuentes oficiales enlazadas tras responder.
- Conservadas las frases de Félix.
- Verificado: pruebas de mecánica, preguntas, dificultad y audio; primer clic activa AudioContext en navegador, sin oreja y vaso nuevo revisados visualmente. La audición en el móvil del usuario sigue pendiente.
- Publicación principal y `/v8/`; versiones anteriores intactas.

## v0.9.0 — Vuelve el vaso de sidra

- Recupera el vaso ancho de 48 unidades y su agarre original. La abertura de colisión vuelve a coincidir con el vaso ancho.
- Conserva la velocidad de balanceo y amplía su recorrido para compensar la abertura mayor; el chorro sigue siendo alcanzable con el vaso.
- Simulación en cuatro fases: mejor posición inmóvil 72%, seguimiento preciso 100%. Pruebas de mecánica, preguntas y audio superadas.
- Las ocho preguntas no cambian; se entrega PREGUNTAS.md con opciones, respuestas y fuentes.
- Publicación en raíz y `/v9/`, conservando versiones anteriores.
