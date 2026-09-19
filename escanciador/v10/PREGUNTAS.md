# Preguntas de Un culín con Félix

40 preguntas verificadas el 19 de septiembre de 2026. Las ocho originales de v0.9.0 se han retirado por petición del usuario; siguen conservadas en esa versión. Las primeras 15 corresponden a las propuestas del usuario.

La fuente de datos es el bloque QUESTIONS de game.js. Regenerar este documento con `node scripts/questions-doc.cjs`; comprobar sincronización con `node scripts/questions-doc.cjs --check`. Los IDs son estables y no dependen del orden; correctAnswer usa índices de 0 a 3. La dificultad nunca se muestra al jugador.

## Distribución

| Dificultad | Preguntas |
| --- | ---: |
| easy | 10 |
| medium | 24 |
| hard | 6 |

| Categoría | Preguntas |
| --- | ---: |
| etnografía | 4 |
| asturiano_y_hablas | 1 |
| gastronomía | 2 |
| fiestas_y_tradiciones | 2 |
| picos_de_europa | 3 |
| historia_y_naturaleza | 2 |
| costa | 1 |
| cultura_popular | 2 |
| naturaleza | 2 |
| historia | 2 |
| fútbol_asturiano | 2 |
| Sporting | 1 |
| Real_Oviedo | 2 |
| otros_deportes | 1 |
| prerrománico | 1 |
| Gijón | 2 |
| Avilés | 2 |
| sidra | 5 |
| Oviedo | 1 |
| música | 1 |
| Asturias_general | 1 |

## Precisiones de verificación

- Panera: la pregunta dice «rasgo habitual», evitando definirla exclusivamente por el número de apoyos.
- Teitos: se concreta la escoba, el material documentado por Turismo Somiedo.
- Curadillos: se retira «pequeños»; la fuente municipal acredita escualos curados, sin imponer ese tamaño a todos ellos.
- Buferrera: se pregunta por una pareja de minerales, sin sugerir que fueran los únicos explotados.
- Covadonga: declaración el 22 de julio de 1918; Ordesa, el 16 de agosto. No fueron simultáneas.
- Reyes: el folleto oficial de Turismo Asturias (página impresa 15, página 17 del PDF) enumera también a Nepociano como usurpador. Son doce excluyéndolo y trece incluyéndolo. La pregunta explicita la exclusión; se elimina la afirmación demasiado simplificada sobre el traslado definitivo de la corte.
- Fútbol: corte explícito al cierre de 2025/26. Sporting: 42 temporadas; Oviedo: 39, incluyendo su regreso en 2025/26. Se contrastan el histórico de LaLiga, el calendario oficial del Sporting y el recuento de prensa deportiva de mayo de 2026. No se mantiene la cifra desactualizada de 38 para el Oviedo.
- Naranco: se pregunta por Ramiro I, sin exigir aceptar una función original exacta; la ficha patrimonial oficial reconoce que esta sigue en discusión.
- Alfonso II: se presenta como tradición jacobea, sin convertir el relato tradicional en certeza documental.
- Se mantienen los comentarios del usuario salvo esas precisiones. Los adicionales tienen comentario propio. Las categorías se agrupan de forma coherente para la rotación.

## Historial local

- `culin_felix_seen_questions`: array JSON con los IDs vistos en el ciclo actual.
- `culin_felix_last_question`: último ID mostrado.
- `culin_felix_last_category`: última categoría mostrada.

`getNextQuestion()` lee el historial, elimina IDs desconocidos y duplicados y sortea entre preguntas pendientes, dando preferencia a otra categoría cuando exista. Al mostrar la pregunta guarda su ID, aunque el jugador no responda. Al agotar todas, reinicia el ciclo y excluye la última pregunta antes de aplicar la preferencia de categoría. Si solo queda una categoría, permite repetir categoría para terminar el ciclo.

Un historial vacío, mal formado o con IDs antiguos no bloquea el juego. Si el navegador impide leer o escribir localStorage, se mantiene el historial en memoria durante esa sesión; no se puede garantizar persistencia al recargar en ese caso. El almacenamiento es por origen y navegador, compartido por la raíz y v10 en GitHub Pages. No hay cuentas ni sincronización entre dispositivos, ni garantía de coordinación atómica entre pestañas simultáneas.

## Catálogo

### 1. pegoyos

**Pregunta:** ¿Cuántos pegoyos tiene normalmente un hórreo asturiano tradicional?

- 1. 3
- 2. 4
- 3. 6
- 4. 8

**Respuesta correcta:** 2. 4

**Comentario:** El hórreo tradicional suele apoyarse sobre cuatro pegoyos. Las paneras son mayores y normalmente utilizan seis o más. Después de aprender esto resulta sorprendentemente difícil pasar junto a uno sin contarle las patas.

**Categoría:** etnografía

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://tesauros.cultura.gob.es/tesauros/bienesculturales/1003212.html)

### 2. panera

**Pregunta:** ¿Cuál de estos rasgos es habitual en una panera asturiana tradicional?

- 1. Tiene cubierta de piedra
- 2. Tiene seis o más pegoyos
- 3. Está apoyada directamente sobre el suelo
- 4. Tiene planta circular

**Respuesta correcta:** 2. Tiene seis o más pegoyos

**Comentario:** El hórreo suele apoyarse sobre cuatro pegoyos. La panera, al ser mayor y normalmente rectangular, suele tener seis o más apoyos. Es un rasgo habitual, no una regla que permita clasificar todos los casos solo contando patas.

**Categoría:** etnografía

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://tesauros.cultura.gob.es/tesauros/bienesculturales/1003212.html)

### 3. teitos

**Pregunta:** ¿Cómo se llaman las construcciones tradicionales de algunas brañas de Somiedo que conservan cubierta vegetal?

- 1. Pallozas
- 2. Corros
- 3. Cabanas de teito
- 4. Tendeyones

**Respuesta correcta:** 3. Cabanas de teito

**Comentario:** Las cabanas de teito son uno de los elementos más característicos del paisaje tradicional de Somiedo. Sus cubiertas se hacían con materiales vegetales, especialmente escoba.

**Categoría:** etnografía

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://somiedoturismo.es/teitos-y-branas)

### 4. cortinos

**Pregunta:** ¿Para qué servían tradicionalmente los cortinos que aún pueden verse en el occidente asturiano?

- 1. Guardar toneles de sidra
- 2. Encerrar ganado durante la noche
- 3. Proteger las colmenas de los osos
- 4. Secar pescado

**Respuesta correcta:** 3. Proteger las colmenas de los osos

**Comentario:** Los cortinos son recintos de piedra construidos alrededor de las colmenas para dificultar el acceso de los osos. Ingeniería defensiva asturiana antes de que existieran las alarmas.

**Categoría:** etnografía

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/-/blogs/mual-pueblo-ejemplar-de-asturias-2018)

### 5. pixueto

**Pregunta:** ¿Cómo se llama el habla tradicional asociada a los habitantes de Cudillero?

- 1. Eonaviego
- 2. Pixueto
- 3. Cabreirés
- 4. Vaqueiro

**Respuesta correcta:** 2. Pixueto

**Comentario:** El pixueto está muy ligado a la identidad marinera de Cudillero y aparece, entre otras cosas, en el famoso pregón de L’Amuravela.

**Categoría:** asturiano_y_hablas

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/agenda-de-asturias/fiestas/-/calendarsuite/event/l-amuravela-cudillero/4735048/jr0cMeS144cd)

### 6. curadillos

**Pregunta:** ¿Qué son los tradicionales curadillos de Cudillero?

- 1. Quesos curados al humo
- 2. Embutidos secados junto al mar
- 3. Escualos secados al aire
- 4. Manzanas secadas al sol

**Respuesta correcta:** 3. Escualos secados al aire

**Comentario:** Los curadillos son escualos que tradicionalmente se secaban al aire para conservarlos. Durante años fue frecuente verlos colgados en las casas del puerto.

**Categoría:** gastronomía

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.turismocudillero.com/wp-content/uploads/Mapa-plano-Cudillero-espa%C3%B1ol-def.pdf)

### 7. amuravela

**Pregunta:** ¿Qué ocurre tradicionalmente durante el pregón de L’Amuravela de Cudillero?

- 1. Se bendicen los barcos pesqueros
- 2. Se subasta el primer pescado de la temporada
- 3. Se repasan con humor los acontecimientos del último año
- 4. Se elige al mejor escanciador del concejo

**Respuesta correcta:** 3. Se repasan con humor los acontecimientos del último año

**Comentario:** L’Amuravela se celebra por San Pedro y utiliza el habla pixueta para hacer un repaso satírico de lo ocurrido durante el año. Vamos, un resumen anual bastante anterior a Twitter.

**Categoría:** fiestas_y_tradiciones

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/agenda-de-asturias/fiestas/-/calendarsuite/event/l-amuravela-cudillero/4735048/jr0cMeS144cd)

### 8. lagos_covadonga

**Pregunta:** ¿Cuáles son los dos grandes lagos permanentes de los Lagos de Covadonga?

- 1. Enol y Bricial
- 2. Enol y Ercina
- 3. Ercina y Bricial
- 4. Enol y Somiedo

**Respuesta correcta:** 2. Enol y Ercina

**Comentario:** Enol y Ercina son los dos grandes lagos permanentes. El Bricial es estacional y aparece cuando las condiciones de agua son favorables.

**Categoría:** picos_de_europa

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/-/blogs/guia-para-visitar-covadonga-los-lagos-y-alrededores)

### 9. buferrera

**Pregunta:** ¿Qué pareja de minerales se explotó antiguamente en las minas de Buferrera, junto a los Lagos de Covadonga?

- 1. Carbón y cobre
- 2. Oro y plata
- 3. Hierro y manganeso
- 4. Estaño y wolframio

**Respuesta correcta:** 3. Hierro y manganeso

**Comentario:** En Buferrera se explotaron principalmente hierro y manganeso. Hoy las antiguas instalaciones mineras forman parte de uno de los recorridos más conocidos de los Lagos de Covadonga.

**Categoría:** historia_y_naturaleza

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/es/senderismo/rutas/familias/ruta-de-los-lagos-de-covadonga)

### 10. bricial

**Pregunta:** ¿Cuál de estos lagos de Covadonga puede llegar a desaparecer temporalmente?

- 1. Enol
- 2. Ercina
- 3. Bricial
- 4. Ninguno

**Respuesta correcta:** 3. Bricial

**Comentario:** El Bricial es un lago estacional. Puede aparecer durante el deshielo o después de periodos de abundante agua y desaparecer de nuevo posteriormente.

**Categoría:** picos_de_europa

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/-/blogs/guia-para-visitar-covadonga-los-lagos-y-alrededores)

### 11. costa_dinosaurios

**Pregunta:** ¿Entre qué localidades se extiende aproximadamente la llamada Costa de los Dinosaurios de Asturias?

- 1. Luarca y Cudillero
- 2. Avilés y Gijón
- 3. Gijón y Ribadesella
- 4. Ribadesella y Llanes

**Respuesta correcta:** 3. Gijón y Ribadesella

**Comentario:** El litoral comprendido aproximadamente entre Gijón y Ribadesella conserva numerosos yacimientos jurásicos y huellas de dinosaurios.

**Categoría:** costa

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.museojurasicoasturias.com/documents/3175063/012817c7-806f-625b-d556-0718aa84ee4f)

### 12. muja

**Pregunta:** ¿En qué concejo se encuentra el Museo del Jurásico de Asturias, el MUJA?

- 1. Villaviciosa
- 2. Ribadesella
- 3. Colunga
- 4. Caravia

**Respuesta correcta:** 3. Colunga

**Comentario:** El MUJA está en Colunga, muy cerca de la playa de La Griega, donde pueden observarse algunas de las huellas de dinosaurio más espectaculares de Asturias.

**Categoría:** cultura_popular

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.museojurasicoasturias.com/documents/3175063/012817c7-806f-625b-d556-0718aa84ee4f)

### 13. la_griega

**Pregunta:** Las enormes huellas de dinosaurio de la playa de La Griega pertenecen a…

- 1. Tiranosaurios
- 2. Triceratops
- 3. Saurópodos
- 4. Velociraptores

**Respuesta correcta:** 3. Saurópodos

**Comentario:** En La Griega se conservan huellas de grandes dinosaurios saurópodos. Algunas alcanzan un tamaño extraordinario y están entre las más grandes conocidas.

**Categoría:** naturaleza

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.parquedelaprehistoria.es/es/web/museo-del-jurasico-de-asturias/playa-de-la-griega)

### 14. primer_parque

**Pregunta:** ¿Cuál fue el primer parque nacional declarado en España?

- 1. Ordesa
- 2. Doñana
- 3. Montaña de Covadonga
- 4. Monfragüe

**Respuesta correcta:** 3. Montaña de Covadonga

**Comentario:** La Montaña de Covadonga fue declarada parque nacional el 22 de julio de 1918; Ordesa lo fue el 16 de agosto de ese mismo año. Desde 1995, el antiguo parque de Covadonga forma parte del ampliado Parque Nacional de los Picos de Europa.

**Categoría:** historia_y_naturaleza

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.miteco.gob.es/es/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/picos-europa/historia.html)

**Fuentes complementarias:** [Fuente 2](https://boe.es/buscar/act.php?id=BOE-A-1918-4414&p=19180818&tn=2)

### 15. reyes_asturias

**Pregunta:** Sin contar al disputado Nepociano, ¿cuántos monarcas enumera la relación tradicional desde Pelayo hasta Alfonso III, ambos incluidos?

- 1. 8
- 2. 10
- 3. 12
- 4. 15

**Respuesta correcta:** 3. 12

**Comentario:** La relación tradicional enumera doce monarcas desde Pelayo hasta Alfonso III. Algunas cronologías añaden a Nepociano, rival de Ramiro I en 842: por eso conviene aclarar a quién se cuenta.

**Categoría:** historia

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/documents/39908/15422261/cultura.pdf/0f344d0e-2101-e908-27a9-faf74197a1e7)

### 16. temporadas_primera_2026

**Pregunta:** Hasta el final de 2025/26, ¿cuántas temporadas en Primera habían disputado Sporting y Real Oviedo, respectivamente?

- 1. 42 y 38
- 2. 43 y 39
- 3. 42 y 39
- 4. 39 y 42

**Respuesta correcta:** 3. 42 y 39

**Comentario:** El Sporting acumulaba 42 y el Oviedo 39. El regreso azul en 2025/26 añadió una a las 38 que tenía antes del ascenso. La pregunta fija el corte para que una nueva temporada no nos cambie la respuesta.

**Categoría:** fútbol_asturiano

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.lavozdeasturias.es/noticia/azulcarbayon/2026/05/18/temporada-plagada-records-negativos-real-oviedo/00031779098545883254502.htm)

**Fuentes complementarias:** [Fuente 2](https://files-dmz.laliga.com/pdfs_estadios/estadio-el-molinon_v3.pdf) · [Fuente 3](https://www.realsporting.com/noticias/definido-el-calendario-del-sporting-202526) · [Fuente 4](https://assets.laliga.com/assets/2019/12/17/originals/1f60d0c83ca8663084d128ce7fe96c38.pdf)

### 17. sporting_subcampeon

**Pregunta:** ¿Cuál es la mejor clasificación del Sporting en una Liga de Primera completada hasta 2025/26?

- 1. Campeón
- 2. Subcampeón
- 3. Tercero
- 4. Cuarto

**Respuesta correcta:** 2. Subcampeón

**Comentario:** En 1978/79 acabó segundo, a cuatro puntos del Real Madrid. Aquel Sporting también fue subcampeón de Copa en 1981 y 1982.

**Categoría:** Sporting

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.realsporting.com/palmares)

**Fuentes complementarias:** [Fuente 2](https://www.realsporting.com/historia-3)

### 18. oviedo_tercero

**Pregunta:** ¿Cuál es la mejor clasificación del Real Oviedo en una Liga de Primera completada hasta 2025/26?

- 1. Subcampeón
- 2. Cuarto
- 3. Quinto
- 4. Tercero

**Respuesta correcta:** 4. Tercero

**Comentario:** Los azules alcanzaron el tercer puesto tres veces: 1934/35, 1935/36 y 1962/63. Las dos primeras llegaron en la época de la célebre delantera eléctrica.

**Categoría:** Real_Oviedo

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://assets.laliga.com/assets/2019/12/17/originals/1f60d0c83ca8663084d128ce7fe96c38.pdf)

**Fuentes complementarias:** [Fuente 2](https://www.realoviedo.es/los-anos-dorados-1933-1950) · [Fuente 3](https://www.realoviedo.es/vuelve-el-esplendor-1958-1965)

### 19. sella

**Pregunta:** ¿Qué localidades unen la salida y la meta del recorrido largo del Descenso Internacional del Sella?

- 1. Cangas de Onís y Arriondas
- 2. Arriondas y Ribadesella
- 3. Arriondas y Llanes
- 4. Cangas de Onís y Ribadesella

**Respuesta correcta:** 2. Arriondas y Ribadesella

**Comentario:** El recorrido de competición entre los puentes de Arriondas y Ribadesella tiene unos 20 kilómetros. No hay que confundirlo con los tramos más cortos de los descensos turísticos.

**Categoría:** otros_deportes

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://descensodelsella.com/content.php?id=13&lang=es&option=com_content&view=article)

### 20. camino_primitivo

**Pregunta:** ¿Qué rey asturiano se considera, según la tradición jacobea, el primer peregrino a Santiago?

- 1. Alfonso II
- 2. Pelayo
- 3. Ramiro I
- 4. Alfonso III

**Respuesta correcta:** 1. Alfonso II

**Comentario:** La tradición sitúa la salida de Alfonso II en Oviedo. El itinerario asociado a aquel viaje dio origen al Camino Primitivo: el nombre no es precisamente una campaña de marketing reciente.

**Categoría:** historia

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/-/blogs/oviedo-la-primera-capital-del-camino-de-santiago)

### 21. naranco

**Pregunta:** ¿Con qué rey se vincula la construcción de Santa María del Naranco?

- 1. Silo
- 2. Alfonso II
- 3. Ramiro I
- 4. Alfonso III

**Respuesta correcta:** 3. Ramiro I

**Comentario:** El edificio se fecha en 848 y se suele interpretar como parte del conjunto palatino de Ramiro I, antes de su uso como iglesia. Su función original exacta sigue siendo objeto de estudio.

**Categoría:** prerrománico

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.spain.info/es/lugares-interes/iglesia-santa-maria-naranco/)

**Fuentes complementarias:** [Fuente 2](https://sig.asturias.es/hipervinculos/Bienes_Interes_Cultural/Fichas_BICs/441506001000BIC.pdf)

### 22. elogio

**Pregunta:** ¿Quién creó el Elogio del Horizonte de Gijón?

- 1. Jorge Oteiza
- 2. Eduardo Chillida
- 3. Antón
- 4. Joaquín Vaquero Turcios

**Respuesta correcta:** 2. Eduardo Chillida

**Comentario:** La escultura corona el cerro de Santa Catalina desde 1990. Está realizada en hormigón: una enorme pieza contemporánea convertida en parte del paisaje de Cimavilla.

**Categoría:** Gijón

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://esculturaurbana.com/podescultura/elogio-del-horizonte/)

**Fuentes complementarias:** [Fuente 2](https://www.turismoasturias.es/en/costa/ruta-faros/etapa4)

### 23. laboral

**Pregunta:** ¿Qué se proyectó inicialmente en el lugar que acabaría siendo la Universidad Laboral de Gijón?

- 1. Una academia naval
- 2. Un hospital militar
- 3. Un orfanato minero
- 4. Una estación ferroviaria

**Respuesta correcta:** 3. Un orfanato minero

**Comentario:** El proyecto se transformó en Universidad Laboral durante su construcción. Luis Moya la concibió como una ciudad autosuficiente, que incluía incluso una granja.

**Categoría:** Gijón

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.laboralciudaddelacultura.com/historia)

### 24. niemeyer

**Pregunta:** ¿De qué país era el arquitecto que diseñó el Centro Niemeyer de Avilés?

- 1. Portugal
- 2. México
- 3. Argentina
- 4. Brasil

**Respuesta correcta:** 4. Brasil

**Comentario:** Oscar Niemeyer también dejó su huella en Brasilia. Donó a Avilés el proyecto de su primera obra en España, pensada como un lugar abierto a la convivencia y la cultura.

**Categoría:** Avilés

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.centroniemeyer.es/centro/oscar-niemeyer/)

### 25. manzanas

**Pregunta:** ¿Cuál de estos nombres corresponde a una variedad de manzana amparada por la DOP Sidra de Asturias?

- 1. Conferencia
- 2. Durona de Tresali
- 3. Reina Claudia
- 4. Blanquilla

**Respuesta correcta:** 2. Durona de Tresali

**Comentario:** Durona de Tresali comparte el catálogo de variedades sidreras con nombres como Raxao, Xuanina o Limón Montés. La pomarada tiene bastante más vocabulario que «roja» y «verde».

**Categoría:** sidra

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.mapa.gob.es/images/es/sidra_de_asturias_2024_02_22_tcm30-211008.pdf)

### 26. pegue

**Pregunta:** Al valorar una sidra, ¿a qué se llama pegue?

- 1. A la espuma que queda adherida al vaso
- 2. Al golpe del corcho al abrir
- 3. Al sabor dulce de la manzana
- 4. Al ruido del chorro

**Respuesta correcta:** 1. A la espuma que queda adherida al vaso

**Comentario:** Tras beber el culín puede quedar una fina película de espuma en las paredes. Ese rastro también forma parte de lo que se observa al valorar cómo se comporta la sidra en el vaso.

**Categoría:** sidra

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.sidraturismoasturias.es/nuestra-sidra/vocabulario-sidrero/)

### 27. espalme

**Pregunta:** ¿Qué se observa al valorar el espalme de una sidra?

- 1. La cantidad de poso de la botella
- 2. La desaparición de la espuma superficial
- 3. La temperatura del vaso
- 4. El color del corcho

**Respuesta correcta:** 2. La desaparición de la espuma superficial

**Comentario:** La espuma que aparece al escanciar debe desaparecer en pocos segundos. En una sidra bien servida no se busca conservar una gran corona de espuma como en algunas cervezas.

**Categoría:** sidra

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/pt/-/blogs/vocabulario-y-liturgia-de-la-sidra)

### 28. aguante

**Pregunta:** En el vocabulario de la sidra, ¿qué describe el aguante?

- 1. Cuánto dura la botella abierta
- 2. La fuerza del escanciador
- 3. La persistencia de burbujas dentro de la sidra
- 4. La resistencia del vaso

**Respuesta correcta:** 3. La persistencia de burbujas dentro de la sidra

**Comentario:** Se observan las burbujas finas que permanecen en el líquido tras escanciar. Es distinto del espalme, que se refiere a la espuma de la superficie.

**Categoría:** sidra

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.sidraturismoasturias.es/nuestra-sidra/vocabulario-sidrero/)

### 29. amaguestu

**Pregunta:** ¿Qué bebida acompaña tradicionalmente a las castañas en un amagüestu?

- 1. Sidra espumosa
- 2. Vino de Cangas
- 3. Sidra dulce
- 4. Anís

**Respuesta correcta:** 3. Sidra dulce

**Comentario:** La sidra dulce es el mosto de manzana sin fermentar. Por eso el amagüestu está tan ligado al otoño y a la temporada de elaboración de sidra.

**Categoría:** fiestas_y_tradiciones

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/gastronomia/sidra)

### 30. cabrales

**Pregunta:** ¿Tiene que llevar siempre tres tipos de leche un queso Cabrales?

- 1. Sí, siempre a partes iguales
- 2. No: puede elaborarse solo con leche de vaca
- 3. No: debe ser solo de oveja
- 4. Sí, pero una tiene que ser de búfala

**Respuesta correcta:** 2. No: puede elaborarse solo con leche de vaca

**Comentario:** La DOP admite leche cruda de vaca o mezclas de dos o tres leches: vaca, oveja y cabra. La maduración se realiza en cuevas naturales de montaña.

**Categoría:** gastronomía

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.quesocabrales.org/elaboracion)

### 31. urriellu

**Pregunta:** ¿Quién acompañó a Pedro Pidal en la primera ascensión documentada al Picu Urriellu, en 1904?

- 1. Gregorio Pérez, el Cainejo
- 2. Dionisio de la Huerta
- 3. Alfonso XIII
- 4. José Ramón Lueje

**Respuesta correcta:** 1. Gregorio Pérez, el Cainejo

**Comentario:** El Cainejo era un pastor de la zona. Aquella cordada convirtió al también llamado Naranjo de Bulnes en un nombre fundamental de la historia del alpinismo español.

**Categoría:** picos_de_europa

**Dificultad:** hard

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/en/covadonga/natural)

### 32. desarme

**Pregunta:** ¿Qué plato abre el menú tradicional del Desarme de Oviedo?

- 1. Fabes con almejas
- 2. Pote asturiano
- 3. Garbanzos con bacalao y espinacas
- 4. Sopa de marisco

**Respuesta correcta:** 3. Garbanzos con bacalao y espinacas

**Comentario:** Después llegan los callos y el arroz con leche. La fecha central de esta celebración gastronómica ovetense es el 19 de octubre. Conviene llegar con hambre.

**Categoría:** Oviedo

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.mintur.gob.es/es-es/gabineteprensa/notasprensa/2025/paginas/el-desarme-de-oviedo-recibe-la-declaracion-de-fiesta-de-interes-turistico-nacional.aspx)

### 33. primer_asturiano_primera

**Pregunta:** ¿Cuál fue el primer club asturiano en ascender a Primera División?

- 1. Sporting
- 2. Real Oviedo
- 3. Real Avilés
- 4. Racing de Sama

**Respuesta correcta:** 2. Real Oviedo

**Comentario:** El ascenso llegó al terminar la temporada 1932/33. El club había nacido en 1926 de la unión del Stadium y el Deportivo de Oviedo.

**Categoría:** fútbol_asturiano

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.realoviedo.es/club)

### 34. debut_oviedo

**Pregunta:** ¿Contra qué equipo debutó el Real Oviedo en Primera en 1933, ganando 7-3?

- 1. Real Madrid
- 2. Athletic Club
- 3. Barcelona
- 4. Valencia

**Respuesta correcta:** 3. Barcelona

**Comentario:** Fue en Buenavista, el 5 de noviembre de 1933. La primera temporada azul en la máxima categoría terminó con un sexto puesto en Liga. Menuda carta de presentación.

**Categoría:** Real_Oviedo

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.realoviedo.es/los-anos-dorados-1933-1950)

### 35. escanciado

**Pregunta:** Al escanciar un culín, ¿dónde debe golpear el chorro?

- 1. En el centro de la sidra que ya hay
- 2. En el borde interior del vaso inclinado
- 3. En la mano que sujeta el vaso
- 4. En el fondo del vaso vertical

**Respuesta correcta:** 2. En el borde interior del vaso inclinado

**Comentario:** El golpe contra el borde permite que la sidra se abra al servirla. El reglamento de los concursos valora el comportamiento del chorro y penaliza que machaque la sidra ya escanciada.

**Categoría:** sidra

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://sidradeasturias.es/campeonato-de-escanciadores/)

**Fuentes complementarias:** [Fuente 2](https://sidradeasturias.es/sidra-lista-para-beber/)

### 36. hevia

**Pregunta:** ¿Qué músico asturiano popularizó Busindre Reel?

- 1. Rodrigo Cuevas
- 2. Hevia
- 3. Nuberu
- 4. Víctor Manuel

**Respuesta correcta:** 2. Hevia

**Comentario:** Hevia ha vuelto a grabar el tema como Busindre Reel 25 dentro de la celebración del aniversario Platinum Europe Award. Hay melodías que uno reconoce antes de recordar su título.

**Categoría:** música

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://hevia.es/)

### 37. concejos

**Pregunta:** ¿En cuántos concejos se divide Asturias?

- 1. 68
- 2. 72
- 3. 78
- 4. 88

**Respuesta correcta:** 3. 78

**Comentario:** En Asturias, concejo es el nombre tradicional del municipio. El total reúne tanto ciudades como territorios rurales muy extensos: no equivale al número de pueblos.

**Categoría:** Asturias_general

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/pt/organiza-tu-viaje/donde-ir)

### 38. bollo_aviles

**Pregunta:** En la tradición de El Bollo de Avilés, ¿quién regala el bollo mantecado a quién?

- 1. Los novios a sus invitados
- 2. Los padrinos a sus ahijados
- 3. Los hijos a sus abuelos
- 4. Los vecinos al alcalde

**Respuesta correcta:** 2. Los padrinos a sus ahijados

**Comentario:** Se entrega el Domingo de Resurrección, correspondiendo a la palma recibida el Domingo de Ramos. El dulce da nombre a una de las fiestas más características de Avilés.

**Categoría:** Avilés

**Dificultad:** easy

**Fuente:** [Consultar fuente](https://turismoaviles.com/festejos/)

### 39. lago_valle

**Pregunta:** ¿En qué concejo está el Lago del Valle, considerado el mayor lago de Asturias?

- 1. Cabrales
- 2. Somiedo
- 3. Caso
- 4. Cangas de Onís

**Respuesta correcta:** 2. Somiedo

**Comentario:** Su pequeña isla es una de sus señas de identidad. Está en las montañas que separan Somiedo de León, en un concejo donde también se encuentran los lagos de Saliencia.

**Categoría:** naturaleza

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/en/descubre/naturaleza/reservas-de-la-biosfera/parque-natural-de-somiedo)

### 40. logo_paraiso

**Pregunta:** ¿Qué elemento arquitectónico aparece en el conocido logotipo de Asturias, Paraíso Natural?

- 1. Una ventana prerrománica
- 2. Un arco del puente de Cangas
- 3. La torre de la Catedral
- 4. Un hórreo

**Respuesta correcta:** 1. Una ventana prerrománica

**Comentario:** El diseño de Arcadi Moradell combina paisaje y patrimonio. La ventana representa el prerrománico asturiano: una pequeña pista cultural escondida en un símbolo que vemos constantemente.

**Categoría:** cultura_popular

**Dificultad:** medium

**Fuente:** [Consultar fuente](https://www.turismoasturias.es/documents/39908/15422261/cultura.pdf/0f344d0e-2101-e908-27a9-faf74197a1e7)
