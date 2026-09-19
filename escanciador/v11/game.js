'use strict';
// Tuning: one horizontal drag, 6 seconds of actual pouring, a gently swaying wrist.
const SETTINGS = { duration: 6, rate: 100, glassY: 350, glassWidth: 48, minX: 270, maxX: 318 };
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const ui = Object.fromEntries(['remaining','pour-state','caught','spilled','result','final-caught','final-spilled','again','hint','audio-test','quiz','summary','question','verdict','answer-detail','answer-comment','quip','answer-source','option-0','option-1','option-2','option-3','start-panel','start-audio','start-silent','start-message'].map(id => [id, document.getElementById(id)]));
const W = 400, H = 560, total = SETTINGS.duration * SETTINGS.rate;
// Fixed shoulder, wrist offset relative to the glass, and two rigid bones.
const ARM = { shoulder: {x:155,y:288}, upper:90, lower:90, wristX:-16, wristY:38, bend:1 };
// Keep the elbow at least 6 degrees to the right of the shoulder.
const verticalReach=SETTINGS.glassY+ARM.wristY-ARM.shoulder.y;
const leftElbowX=ARM.upper*Math.sin(Math.PI/30);
const leftElbowY=ARM.upper*Math.cos(Math.PI/30);
SETTINGS.minX=Math.max(SETTINGS.minX,ARM.shoulder.x-ARM.wristX+leftElbowX+Math.sqrt(ARM.lower**2-(verticalReach-leftElbowY)**2));
const reach = ARM.upper + ARM.lower - 3;
SETTINGS.maxX = Math.min(SETTINGS.maxX, ARM.shoulder.x - ARM.wristX + Math.sqrt(reach ** 2 - (SETTINGS.glassY + ARM.wristY - ARM.shoulder.y) ** 2));
function solveArm(shoulder, hand, upper, lower, bend=1) {
  const dx=hand.x-shoulder.x, dy=hand.y-shoulder.y;
  const distance=clamp(Math.hypot(dx,dy),Math.abs(upper-lower)+.001,upper+lower-.001);
  const angle=Math.atan2(dy,dx)+bend*Math.acos(clamp((upper*upper+distance*distance-lower*lower)/(2*upper*distance),-1,1));
  return {x:shoulder.x+Math.cos(angle)*upper,y:shoulder.y+Math.sin(angle)*upper};
}
// Replace these methods with recorded samples later; gameplay only calls this interface.
const sound = {
  enabled:true, context:null, gain:null, filter:null, source:null, buffer:null, lastSplash:-1,
  active:false, inside:false, needsRefresh:false, lastTone:null,
  report() {
    const status=this.context?.state||'unavailable';
    canvas.dataset.audioState=status;
    return status==='running';
  },
  unlock() {
    if(!this.enabled)return Promise.resolve(false);
    try {
      // Optional on Safari; do not let an unsupported session setting break audio.
      try { if(window.navigator?.audioSession)window.navigator.audioSession.type='playback'; } catch(error) {}
      if(this.needsRefresh) {
        this.stopSource();
        const old=this.context;
        this.context=null;this.gain=null;this.filter=null;this.buffer=null;
        if(old&&old.state!=='closed')old.close().catch(()=>{});
        this.needsRefresh=false;
      }
      if(!this.context||this.context.state==='closed') {
        this.stopSource();
        const Audio=window.AudioContext||window.webkitAudioContext;
        if(!Audio){this.report();return Promise.resolve(false);}
        const c=this.context=new Audio();
        c.onstatechange=()=>{if(this.context===c){this.report();this.sync();}};
        canvas.dataset.audioState=c.state;
        const buffer=this.buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);
        const samples=buffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        this.filter=c.createBiquadFilter();this.filter.type='bandpass';this.filter.Q.value=.7;
        this.gain=c.createGain();this.gain.gain.value=0;
        this.filter.connect(this.gain).connect(c.destination);
        this.lastSplash=-1;this.lastTone=null;
      }
      // Call resume synchronously inside the gesture, including Safari's interrupted state.
      const resumed=this.context.state!=='running'?this.context.resume():Promise.resolve();
      const current=this.context;
      return Promise.resolve(resumed).then(()=>{if(this.context!==current)return false;this.sync();return this.report();}).catch(()=>{this.report();return false;});
    } catch(error) {
      canvas.dataset.audioState='error';
      return Promise.resolve(false);
    }
  },
  stopSource() {
    if(this.source){this.source.stop();this.source.disconnect();this.source=null;}
    this.lastTone=null;
  },
  pause() {
    this.pour(false,false);
    // Rebuild at the next gesture after backgrounding: a running context alone
    // does not prove the mobile audio output survived an interruption.
    this.needsRefresh=true;
  },
  pour(active,inside) {
    this.active=active;this.inside=inside;
    this.sync();
  },
  sync() {
    const c=this.context;
    if(!this.gain||!c)return;
    if(!this.enabled||!this.active||c.state!=='running') {
      this.stopSource();
      this.gain.gain.cancelScheduledValues(c.currentTime);
      this.gain.gain.setValueAtTime(0,c.currentTime);
      return;
    }
    if(!this.source) {
      const source=this.source=c.createBufferSource();
      source.buffer=this.buffer;source.loop=true;
      source.connect(this.filter);source.start();
    }
    // Schedule only when the sound changes, not on every animation frame.
    if(this.lastTone!==this.inside) {
      const t=c.currentTime;this.lastTone=this.inside;
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setTargetAtTime(this.inside ? .09 : .06,t,.025);
      this.filter.frequency.cancelScheduledValues(t);
      this.filter.frequency.setTargetAtTime(this.inside?1500:850,t,.04);
    }
  },
  splash() {
    const c=this.context;if(!this.enabled||!c||c.state!=='running'||c.currentTime-this.lastSplash<.13)return;
    this.lastSplash=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();o.type='triangle';
    o.frequency.setValueAtTime(190,c.currentTime);o.frequency.exponentialRampToValueAtTime(65,c.currentTime+.07);
    g.gain.setValueAtTime(.018,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.08);
    o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.09);o.onended=()=>{o.disconnect();g.disconnect();};
  },
  finish() {
    const c=this.context;if(!this.enabled||!c||c.state!=='running')return;
    [523,659].forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+i*.11;
      o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+.22);
      o.connect(g).connect(c.destination);o.start(t);o.stop(t+.23);o.onended=()=>{o.disconnect();g.disconnect();};});
  }
};
// Four choices, one correct answer. Sources are shown only after answering. Verified 2026-09-19.
const QUESTIONS = [
  {
    "id": "pegoyos",
    "question": "¿Cuántos pegoyos tiene normalmente un hórreo asturiano tradicional?",
    "answers": [
      "3",
      "4",
      "6",
      "8"
    ],
    "correctAnswer": 1,
    "comment": "El hórreo tradicional suele apoyarse sobre cuatro pegoyos. Las paneras son mayores y normalmente utilizan seis o más. Después de aprender esto resulta sorprendentemente difícil pasar junto a uno sin contarle las patas.",
    "category": "etnografía",
    "difficulty": "easy",
    "source": "https://tesauros.cultura.gob.es/tesauros/bienesculturales/1003212.html"
  },
  {
    "id": "panera",
    "question": "¿Cuál de estos rasgos es habitual en una panera asturiana tradicional?",
    "answers": [
      "Tiene cubierta de piedra",
      "Tiene seis o más pegoyos",
      "Está apoyada directamente sobre el suelo",
      "Tiene planta circular"
    ],
    "correctAnswer": 1,
    "comment": "El hórreo suele apoyarse sobre cuatro pegoyos. La panera, al ser mayor y normalmente rectangular, suele tener seis o más apoyos. Es un rasgo habitual, no una regla que permita clasificar todos los casos solo contando patas.",
    "category": "etnografía",
    "difficulty": "medium",
    "source": "https://tesauros.cultura.gob.es/tesauros/bienesculturales/1003212.html"
  },
  {
    "id": "teitos",
    "question": "¿Cómo se llaman las construcciones tradicionales de algunas brañas de Somiedo que conservan cubierta vegetal?",
    "answers": [
      "Pallozas",
      "Corros",
      "Cabanas de teito",
      "Tendeyones"
    ],
    "correctAnswer": 2,
    "comment": "Las cabanas de teito son uno de los elementos más característicos del paisaje tradicional de Somiedo. Sus cubiertas se hacían con materiales vegetales, especialmente escoba.",
    "category": "etnografía",
    "difficulty": "medium",
    "source": "https://somiedoturismo.es/teitos-y-branas"
  },
  {
    "id": "cortinos",
    "question": "¿Para qué servían tradicionalmente los cortinos que aún pueden verse en el occidente asturiano?",
    "answers": [
      "Guardar toneles de sidra",
      "Encerrar ganado durante la noche",
      "Proteger las colmenas de los osos",
      "Secar pescado"
    ],
    "correctAnswer": 2,
    "comment": "Los cortinos son recintos de piedra construidos alrededor de las colmenas para dificultar el acceso de los osos. Ingeniería defensiva asturiana antes de que existieran las alarmas.",
    "category": "etnografía",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/-/blogs/mual-pueblo-ejemplar-de-asturias-2018"
  },
  {
    "id": "pixueto",
    "question": "¿Cómo se llama el habla tradicional asociada a los habitantes de Cudillero?",
    "answers": [
      "Eonaviego",
      "Pixueto",
      "Cabreirés",
      "Vaqueiro"
    ],
    "correctAnswer": 1,
    "comment": "El pixueto está muy ligado a la identidad marinera de Cudillero y aparece, entre otras cosas, en el famoso pregón de L’Amuravela.",
    "category": "asturiano_y_hablas",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/agenda-de-asturias/fiestas/-/calendarsuite/event/l-amuravela-cudillero/4735048/jr0cMeS144cd"
  },
  {
    "id": "curadillos",
    "question": "¿Qué son los tradicionales curadillos de Cudillero?",
    "answers": [
      "Quesos curados al humo",
      "Embutidos secados junto al mar",
      "Escualos secados al aire",
      "Manzanas secadas al sol"
    ],
    "correctAnswer": 2,
    "comment": "Los curadillos son escualos que tradicionalmente se secaban al aire para conservarlos. Durante años fue frecuente verlos colgados en las casas del puerto.",
    "category": "gastronomía",
    "difficulty": "hard",
    "source": "https://www.turismocudillero.com/wp-content/uploads/Mapa-plano-Cudillero-espa%C3%B1ol-def.pdf"
  },
  {
    "id": "amuravela",
    "question": "¿Qué ocurre tradicionalmente durante el pregón de L’Amuravela de Cudillero?",
    "answers": [
      "Se bendicen los barcos pesqueros",
      "Se subasta el primer pescado de la temporada",
      "Se repasan con humor los acontecimientos del último año",
      "Se elige al mejor escanciador del concejo"
    ],
    "correctAnswer": 2,
    "comment": "L’Amuravela se celebra por San Pedro y utiliza el habla pixueta para hacer un repaso satírico de lo ocurrido durante el año. Vamos, un resumen anual bastante anterior a Twitter.",
    "category": "fiestas_y_tradiciones",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/agenda-de-asturias/fiestas/-/calendarsuite/event/l-amuravela-cudillero/4735048/jr0cMeS144cd"
  },
  {
    "id": "lagos_covadonga",
    "question": "¿Cuáles son los dos grandes lagos permanentes de los Lagos de Covadonga?",
    "answers": [
      "Enol y Bricial",
      "Enol y Ercina",
      "Ercina y Bricial",
      "Enol y Somiedo"
    ],
    "correctAnswer": 1,
    "comment": "Enol y Ercina son los dos grandes lagos permanentes. El Bricial es estacional y aparece cuando las condiciones de agua son favorables.",
    "category": "picos_de_europa",
    "difficulty": "easy",
    "source": "https://www.turismoasturias.es/-/blogs/guia-para-visitar-covadonga-los-lagos-y-alrededores"
  },
  {
    "id": "buferrera",
    "question": "¿Qué pareja de minerales se explotó antiguamente en las minas de Buferrera, junto a los Lagos de Covadonga?",
    "answers": [
      "Carbón y cobre",
      "Oro y plata",
      "Hierro y manganeso",
      "Estaño y wolframio"
    ],
    "correctAnswer": 2,
    "comment": "En Buferrera se explotaron principalmente hierro y manganeso. Hoy las antiguas instalaciones mineras forman parte de uno de los recorridos más conocidos de los Lagos de Covadonga.",
    "category": "historia_y_naturaleza",
    "difficulty": "hard",
    "source": "https://www.turismoasturias.es/es/senderismo/rutas/familias/ruta-de-los-lagos-de-covadonga"
  },
  {
    "id": "bricial",
    "question": "¿Cuál de estos lagos de Covadonga puede llegar a desaparecer temporalmente?",
    "answers": [
      "Enol",
      "Ercina",
      "Bricial",
      "Ninguno"
    ],
    "correctAnswer": 2,
    "comment": "El Bricial es un lago estacional. Puede aparecer durante el deshielo o después de periodos de abundante agua y desaparecer de nuevo posteriormente.",
    "category": "picos_de_europa",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/-/blogs/guia-para-visitar-covadonga-los-lagos-y-alrededores"
  },
  {
    "id": "costa_dinosaurios",
    "question": "¿Entre qué localidades se extiende aproximadamente la llamada Costa de los Dinosaurios de Asturias?",
    "answers": [
      "Luarca y Cudillero",
      "Avilés y Gijón",
      "Gijón y Ribadesella",
      "Ribadesella y Llanes"
    ],
    "correctAnswer": 2,
    "comment": "El litoral comprendido aproximadamente entre Gijón y Ribadesella conserva numerosos yacimientos jurásicos y huellas de dinosaurios.",
    "category": "costa",
    "difficulty": "medium",
    "source": "https://www.museojurasicoasturias.com/documents/3175063/012817c7-806f-625b-d556-0718aa84ee4f"
  },
  {
    "id": "muja",
    "question": "¿En qué concejo se encuentra el Museo del Jurásico de Asturias, el MUJA?",
    "answers": [
      "Villaviciosa",
      "Ribadesella",
      "Colunga",
      "Caravia"
    ],
    "correctAnswer": 2,
    "comment": "El MUJA está en Colunga, muy cerca de la playa de La Griega, donde pueden observarse algunas de las huellas de dinosaurio más espectaculares de Asturias.",
    "category": "cultura_popular",
    "difficulty": "easy",
    "source": "https://www.museojurasicoasturias.com/documents/3175063/012817c7-806f-625b-d556-0718aa84ee4f"
  },
  {
    "id": "la_griega",
    "question": "Las enormes huellas de dinosaurio de la playa de La Griega pertenecen a…",
    "answers": [
      "Tiranosaurios",
      "Triceratops",
      "Saurópodos",
      "Velociraptores"
    ],
    "correctAnswer": 2,
    "comment": "En La Griega se conservan huellas de grandes dinosaurios saurópodos. Algunas alcanzan un tamaño extraordinario y están entre las más grandes conocidas.",
    "category": "naturaleza",
    "difficulty": "medium",
    "source": "https://www.parquedelaprehistoria.es/es/web/museo-del-jurasico-de-asturias/playa-de-la-griega"
  },
  {
    "id": "primer_parque",
    "question": "¿Cuál fue el primer parque nacional declarado en España?",
    "answers": [
      "Ordesa",
      "Doñana",
      "Montaña de Covadonga",
      "Monfragüe"
    ],
    "correctAnswer": 2,
    "comment": "La Montaña de Covadonga fue declarada parque nacional el 22 de julio de 1918; Ordesa lo fue el 16 de agosto de ese mismo año. Desde 1995, el antiguo parque de Covadonga forma parte del ampliado Parque Nacional de los Picos de Europa.",
    "category": "historia_y_naturaleza",
    "difficulty": "medium",
    "source": "https://www.miteco.gob.es/es/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/picos-europa/historia.html",
    "additionalSources": [
      "https://boe.es/buscar/act.php?id=BOE-A-1918-4414&p=19180818&tn=2"
    ]
  },
  {
    "id": "reyes_asturias",
    "question": "Sin contar al disputado Nepociano, ¿cuántos monarcas enumera la relación tradicional desde Pelayo hasta Alfonso III, ambos incluidos?",
    "answers": [
      "8",
      "10",
      "12",
      "15"
    ],
    "correctAnswer": 2,
    "comment": "La relación tradicional enumera doce monarcas desde Pelayo hasta Alfonso III. Algunas cronologías añaden a Nepociano, rival de Ramiro I en 842: por eso conviene aclarar a quién se cuenta.",
    "category": "historia",
    "difficulty": "hard",
    "source": "https://www.turismoasturias.es/documents/39908/15422261/cultura.pdf/0f344d0e-2101-e908-27a9-faf74197a1e7"
  },
  {
    "id": "temporadas_primera_2026",
    "question": "Hasta el final de 2025/26, ¿cuántas temporadas en Primera habían disputado Sporting y Real Oviedo, respectivamente?",
    "answers": [
      "42 y 38",
      "43 y 39",
      "42 y 39",
      "39 y 42"
    ],
    "correctAnswer": 2,
    "comment": "El Sporting acumulaba 42 y el Oviedo 39. El regreso azul en 2025/26 añadió una a las 38 que tenía antes del ascenso. La pregunta fija el corte para que una nueva temporada no nos cambie la respuesta.",
    "category": "fútbol_asturiano",
    "difficulty": "hard",
    "source": "https://www.lavozdeasturias.es/noticia/azulcarbayon/2026/05/18/temporada-plagada-records-negativos-real-oviedo/00031779098545883254502.htm",
    "additionalSources": [
      "https://files-dmz.laliga.com/pdfs_estadios/estadio-el-molinon_v3.pdf",
      "https://www.realsporting.com/noticias/definido-el-calendario-del-sporting-202526",
      "https://assets.laliga.com/assets/2019/12/17/originals/1f60d0c83ca8663084d128ce7fe96c38.pdf"
    ]
  },
  {
    "id": "sporting_subcampeon",
    "question": "¿Cuál es la mejor clasificación del Sporting en una Liga de Primera completada hasta 2025/26?",
    "answers": [
      "Campeón",
      "Subcampeón",
      "Tercero",
      "Cuarto"
    ],
    "correctAnswer": 1,
    "comment": "En 1978/79 acabó segundo, a cuatro puntos del Real Madrid. Aquel Sporting también fue subcampeón de Copa en 1981 y 1982.",
    "category": "Sporting",
    "difficulty": "medium",
    "source": "https://www.realsporting.com/palmares",
    "additionalSources": [
      "https://www.realsporting.com/historia-3"
    ]
  },
  {
    "id": "oviedo_tercero",
    "question": "¿Cuál es la mejor clasificación del Real Oviedo en una Liga de Primera completada hasta 2025/26?",
    "answers": [
      "Subcampeón",
      "Cuarto",
      "Quinto",
      "Tercero"
    ],
    "correctAnswer": 3,
    "comment": "Los azules alcanzaron el tercer puesto tres veces: 1934/35, 1935/36 y 1962/63. Las dos primeras llegaron en la época de la célebre delantera eléctrica.",
    "category": "Real_Oviedo",
    "difficulty": "medium",
    "source": "https://assets.laliga.com/assets/2019/12/17/originals/1f60d0c83ca8663084d128ce7fe96c38.pdf",
    "additionalSources": [
      "https://www.realoviedo.es/los-anos-dorados-1933-1950",
      "https://www.realoviedo.es/vuelve-el-esplendor-1958-1965"
    ]
  },
  {
    "id": "sella",
    "question": "¿Qué localidades unen la salida y la meta del recorrido largo del Descenso Internacional del Sella?",
    "answers": [
      "Cangas de Onís y Arriondas",
      "Arriondas y Ribadesella",
      "Arriondas y Llanes",
      "Cangas de Onís y Ribadesella"
    ],
    "correctAnswer": 1,
    "comment": "El recorrido de competición entre los puentes de Arriondas y Ribadesella tiene unos 20 kilómetros. No hay que confundirlo con los tramos más cortos de los descensos turísticos.",
    "category": "otros_deportes",
    "difficulty": "easy",
    "source": "https://descensodelsella.com/content.php?id=13&lang=es&option=com_content&view=article"
  },
  {
    "id": "camino_primitivo",
    "question": "¿Qué rey asturiano se considera, según la tradición jacobea, el primer peregrino a Santiago?",
    "answers": [
      "Alfonso II",
      "Pelayo",
      "Ramiro I",
      "Alfonso III"
    ],
    "correctAnswer": 0,
    "comment": "La tradición sitúa la salida de Alfonso II en Oviedo. El itinerario asociado a aquel viaje dio origen al Camino Primitivo: el nombre no es precisamente una campaña de marketing reciente.",
    "category": "historia",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/-/blogs/oviedo-la-primera-capital-del-camino-de-santiago"
  },
  {
    "id": "naranco",
    "question": "¿Con qué rey se vincula la construcción de Santa María del Naranco?",
    "answers": [
      "Silo",
      "Alfonso II",
      "Ramiro I",
      "Alfonso III"
    ],
    "correctAnswer": 2,
    "comment": "El edificio se fecha en 848 y se suele interpretar como parte del conjunto palatino de Ramiro I, antes de su uso como iglesia. Su función original exacta sigue siendo objeto de estudio.",
    "category": "prerrománico",
    "difficulty": "easy",
    "source": "https://www.spain.info/es/lugares-interes/iglesia-santa-maria-naranco/",
    "additionalSources": [
      "https://sig.asturias.es/hipervinculos/Bienes_Interes_Cultural/Fichas_BICs/441506001000BIC.pdf"
    ]
  },
  {
    "id": "elogio",
    "question": "¿Quién creó el Elogio del Horizonte de Gijón?",
    "answers": [
      "Jorge Oteiza",
      "Eduardo Chillida",
      "Antón",
      "Joaquín Vaquero Turcios"
    ],
    "correctAnswer": 1,
    "comment": "La escultura corona el cerro de Santa Catalina desde 1990. Está realizada en hormigón: una enorme pieza contemporánea convertida en parte del paisaje de Cimavilla.",
    "category": "Gijón",
    "difficulty": "medium",
    "source": "https://esculturaurbana.com/podescultura/elogio-del-horizonte/",
    "additionalSources": [
      "https://www.turismoasturias.es/en/costa/ruta-faros/etapa4"
    ]
  },
  {
    "id": "laboral",
    "question": "¿Qué se proyectó inicialmente en el lugar que acabaría siendo la Universidad Laboral de Gijón?",
    "answers": [
      "Una academia naval",
      "Un hospital militar",
      "Un orfanato minero",
      "Una estación ferroviaria"
    ],
    "correctAnswer": 2,
    "comment": "El proyecto se transformó en Universidad Laboral durante su construcción. Luis Moya la concibió como una ciudad autosuficiente, que incluía incluso una granja.",
    "category": "Gijón",
    "difficulty": "medium",
    "source": "https://www.laboralciudaddelacultura.com/historia"
  },
  {
    "id": "niemeyer",
    "question": "¿De qué país era el arquitecto que diseñó el Centro Niemeyer de Avilés?",
    "answers": [
      "Portugal",
      "México",
      "Argentina",
      "Brasil"
    ],
    "correctAnswer": 3,
    "comment": "Oscar Niemeyer también dejó su huella en Brasilia. Donó a Avilés el proyecto de su primera obra en España, pensada como un lugar abierto a la convivencia y la cultura.",
    "category": "Avilés",
    "difficulty": "medium",
    "source": "https://www.centroniemeyer.es/centro/oscar-niemeyer/"
  },
  {
    "id": "manzanas",
    "question": "¿Cuál de estos nombres corresponde a una variedad de manzana amparada por la DOP Sidra de Asturias?",
    "answers": [
      "Conferencia",
      "Durona de Tresali",
      "Reina Claudia",
      "Blanquilla"
    ],
    "correctAnswer": 1,
    "comment": "Durona de Tresali comparte el catálogo de variedades sidreras con nombres como Raxao, Xuanina o Limón Montés. La pomarada tiene bastante más vocabulario que «roja» y «verde».",
    "category": "sidra",
    "difficulty": "hard",
    "source": "https://www.mapa.gob.es/images/es/sidra_de_asturias_2024_02_22_tcm30-211008.pdf"
  },
  {
    "id": "pegue",
    "question": "Al valorar una sidra, ¿a qué se llama pegue?",
    "answers": [
      "A la espuma que queda adherida al vaso",
      "Al golpe del corcho al abrir",
      "Al sabor dulce de la manzana",
      "Al ruido del chorro"
    ],
    "correctAnswer": 0,
    "comment": "Tras beber el culín puede quedar una fina película de espuma en las paredes. Ese rastro también forma parte de lo que se observa al valorar cómo se comporta la sidra en el vaso.",
    "category": "sidra",
    "difficulty": "medium",
    "source": "https://www.sidraturismoasturias.es/nuestra-sidra/vocabulario-sidrero/"
  },
  {
    "id": "espalme",
    "question": "¿Qué se observa al valorar el espalme de una sidra?",
    "answers": [
      "La cantidad de poso de la botella",
      "La desaparición de la espuma superficial",
      "La temperatura del vaso",
      "El color del corcho"
    ],
    "correctAnswer": 1,
    "comment": "La espuma que aparece al escanciar debe desaparecer en pocos segundos. En una sidra bien servida no se busca conservar una gran corona de espuma como en algunas cervezas.",
    "category": "sidra",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/pt/-/blogs/vocabulario-y-liturgia-de-la-sidra"
  },
  {
    "id": "aguante",
    "question": "En el vocabulario de la sidra, ¿qué describe el aguante?",
    "answers": [
      "Cuánto dura la botella abierta",
      "La fuerza del escanciador",
      "La persistencia de burbujas dentro de la sidra",
      "La resistencia del vaso"
    ],
    "correctAnswer": 2,
    "comment": "Se observan las burbujas finas que permanecen en el líquido tras escanciar. Es distinto del espalme, que se refiere a la espuma de la superficie.",
    "category": "sidra",
    "difficulty": "medium",
    "source": "https://www.sidraturismoasturias.es/nuestra-sidra/vocabulario-sidrero/"
  },
  {
    "id": "amaguestu",
    "question": "¿Qué bebida acompaña tradicionalmente a las castañas en un amagüestu?",
    "answers": [
      "Sidra espumosa",
      "Vino de Cangas",
      "Sidra dulce",
      "Anís"
    ],
    "correctAnswer": 2,
    "comment": "La sidra dulce es el mosto de manzana sin fermentar. Por eso el amagüestu está tan ligado al otoño y a la temporada de elaboración de sidra.",
    "category": "fiestas_y_tradiciones",
    "difficulty": "easy",
    "source": "https://www.turismoasturias.es/gastronomia/sidra"
  },
  {
    "id": "cabrales",
    "question": "¿Tiene que llevar siempre tres tipos de leche un queso Cabrales?",
    "answers": [
      "Sí, siempre a partes iguales",
      "No: puede elaborarse solo con leche de vaca",
      "No: debe ser solo de oveja",
      "Sí, pero una tiene que ser de búfala"
    ],
    "correctAnswer": 1,
    "comment": "La DOP admite leche cruda de vaca o mezclas de dos o tres leches: vaca, oveja y cabra. La maduración se realiza en cuevas naturales de montaña.",
    "category": "gastronomía",
    "difficulty": "medium",
    "source": "https://www.quesocabrales.org/elaboracion"
  },
  {
    "id": "urriellu",
    "question": "¿Quién acompañó a Pedro Pidal en la primera ascensión documentada al Picu Urriellu, en 1904?",
    "answers": [
      "Gregorio Pérez, el Cainejo",
      "Dionisio de la Huerta",
      "Alfonso XIII",
      "José Ramón Lueje"
    ],
    "correctAnswer": 0,
    "comment": "El Cainejo era un pastor de la zona. Aquella cordada convirtió al también llamado Naranjo de Bulnes en un nombre fundamental de la historia del alpinismo español.",
    "category": "picos_de_europa",
    "difficulty": "hard",
    "source": "https://www.turismoasturias.es/en/covadonga/natural"
  },
  {
    "id": "desarme",
    "question": "¿Qué plato abre el menú tradicional del Desarme de Oviedo?",
    "answers": [
      "Fabes con almejas",
      "Pote asturiano",
      "Garbanzos con bacalao y espinacas",
      "Sopa de marisco"
    ],
    "correctAnswer": 2,
    "comment": "Después llegan los callos y el arroz con leche. La fecha central de esta celebración gastronómica ovetense es el 19 de octubre. Conviene llegar con hambre.",
    "category": "Oviedo",
    "difficulty": "medium",
    "source": "https://www.mintur.gob.es/es-es/gabineteprensa/notasprensa/2025/paginas/el-desarme-de-oviedo-recibe-la-declaracion-de-fiesta-de-interes-turistico-nacional.aspx"
  },
  {
    "id": "primer_asturiano_primera",
    "question": "¿Cuál fue el primer club asturiano en ascender a Primera División?",
    "answers": [
      "Sporting",
      "Real Oviedo",
      "Real Avilés",
      "Racing de Sama"
    ],
    "correctAnswer": 1,
    "comment": "El ascenso llegó al terminar la temporada 1932/33. El club había nacido en 1926 de la unión del Stadium y el Deportivo de Oviedo.",
    "category": "fútbol_asturiano",
    "difficulty": "easy",
    "source": "https://www.realoviedo.es/club"
  },
  {
    "id": "debut_oviedo",
    "question": "¿Contra qué equipo debutó el Real Oviedo en Primera en 1933, ganando 7-3?",
    "answers": [
      "Real Madrid",
      "Athletic Club",
      "Barcelona",
      "Valencia"
    ],
    "correctAnswer": 2,
    "comment": "Fue en Buenavista, el 5 de noviembre de 1933. La primera temporada azul en la máxima categoría terminó con un sexto puesto en Liga. Menuda carta de presentación.",
    "category": "Real_Oviedo",
    "difficulty": "medium",
    "source": "https://www.realoviedo.es/los-anos-dorados-1933-1950"
  },
  {
    "id": "escanciado",
    "question": "Al escanciar un culín, ¿dónde debe golpear el chorro?",
    "answers": [
      "En el centro de la sidra que ya hay",
      "En el borde interior del vaso inclinado",
      "En la mano que sujeta el vaso",
      "En el fondo del vaso vertical"
    ],
    "correctAnswer": 1,
    "comment": "El golpe contra el borde permite que la sidra se abra al servirla. El reglamento de los concursos valora el comportamiento del chorro y penaliza que machaque la sidra ya escanciada.",
    "category": "sidra",
    "difficulty": "medium",
    "source": "https://sidradeasturias.es/campeonato-de-escanciadores/",
    "additionalSources": [
      "https://sidradeasturias.es/sidra-lista-para-beber/"
    ]
  },
  {
    "id": "hevia",
    "question": "¿Qué músico asturiano popularizó Busindre Reel?",
    "answers": [
      "Rodrigo Cuevas",
      "Hevia",
      "Nuberu",
      "Víctor Manuel"
    ],
    "correctAnswer": 1,
    "comment": "Hevia ha vuelto a grabar el tema como Busindre Reel 25 dentro de la celebración del aniversario Platinum Europe Award. Hay melodías que uno reconoce antes de recordar su título.",
    "category": "música",
    "difficulty": "easy",
    "source": "https://hevia.es/"
  },
  {
    "id": "concejos",
    "question": "¿En cuántos concejos se divide Asturias?",
    "answers": [
      "68",
      "72",
      "78",
      "88"
    ],
    "correctAnswer": 2,
    "comment": "En Asturias, concejo es el nombre tradicional del municipio. El total reúne tanto ciudades como territorios rurales muy extensos: no equivale al número de pueblos.",
    "category": "Asturias_general",
    "difficulty": "easy",
    "source": "https://www.turismoasturias.es/pt/organiza-tu-viaje/donde-ir"
  },
  {
    "id": "bollo_aviles",
    "question": "En la tradición de El Bollo de Avilés, ¿quién regala el bollo mantecado a quién?",
    "answers": [
      "Los novios a sus invitados",
      "Los padrinos a sus ahijados",
      "Los hijos a sus abuelos",
      "Los vecinos al alcalde"
    ],
    "correctAnswer": 1,
    "comment": "Se entrega el Domingo de Resurrección, correspondiendo a la palma recibida el Domingo de Ramos. El dulce da nombre a una de las fiestas más características de Avilés.",
    "category": "Avilés",
    "difficulty": "easy",
    "source": "https://turismoaviles.com/festejos/"
  },
  {
    "id": "lago_valle",
    "question": "¿En qué concejo está el Lago del Valle, considerado el mayor lago de Asturias?",
    "answers": [
      "Cabrales",
      "Somiedo",
      "Caso",
      "Cangas de Onís"
    ],
    "correctAnswer": 1,
    "comment": "Su pequeña isla es una de sus señas de identidad. Está en las montañas que separan Somiedo de León, en un concejo donde también se encuentran los lagos de Saliencia.",
    "category": "naturaleza",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/en/descubre/naturaleza/reservas-de-la-biosfera/parque-natural-de-somiedo"
  },
  {
    "id": "logo_paraiso",
    "question": "¿Qué elemento arquitectónico aparece en el conocido logotipo de Asturias, Paraíso Natural?",
    "answers": [
      "Una ventana prerrománica",
      "Un arco del puente de Cangas",
      "La torre de la Catedral",
      "Un hórreo"
    ],
    "correctAnswer": 0,
    "comment": "El diseño de Arcadi Moradell combina paisaje y patrimonio. La ventana representa el prerrománico asturiano: una pequeña pista cultural escondida en un símbolo que vemos constantemente.",
    "category": "cultura_popular",
    "difficulty": "medium",
    "source": "https://www.turismoasturias.es/documents/39908/15422261/cultura.pdf/0f344d0e-2101-e908-27a9-faf74197a1e7"
  }
];
// IDs are permanent: never derive them from array positions or reuse a retired ID.
const QUESTION_STORAGE = {
  seen: 'culin_felix_seen_questions',
  last: 'culin_felix_last_question',
  category: 'culin_felix_last_category'
};
let questionHistory = { seen: [], last: null, category: null };
let questionStorageAvailable = true;
function readQuestionHistory() {
  if (questionStorageAvailable) {
    try {
      const stored = window.localStorage.getItem(QUESTION_STORAGE.seen);
      let seen;
      try { seen = JSON.parse(stored || '[]'); } catch { seen = []; }
      questionHistory = {
        seen: Array.isArray(seen) ? seen : [],
        last: window.localStorage.getItem(QUESTION_STORAGE.last),
        category: window.localStorage.getItem(QUESTION_STORAGE.category)
      };
    } catch {
      // Blocked storage must never prevent playing; keep a session-only history.
      questionStorageAvailable = false;
    }
  }
  const validIds = new Set(QUESTIONS.map(q => q.id));
  questionHistory.seen = [...new Set(questionHistory.seen.filter(id => validIds.has(id)))];
  return questionHistory;
}
function getNextQuestion() {
  const history = readQuestionHistory();
  const seen = new Set(history.seen);
  let candidates = QUESTIONS.filter(q => !seen.has(q.id));
  if (!candidates.length) {
    seen.clear();
    candidates = QUESTIONS.filter(q => q.id !== history.last);
    if (!candidates.length) candidates = QUESTIONS;
  }
  const differentCategory = candidates.filter(q => q.category !== history.category);
  if (differentCategory.length) candidates = differentCategory;
  const question = candidates[Math.floor(Math.random() * candidates.length)];
  if (!question) return null;
  // Called only when showing the question: skipping an answer still counts as seen.
  seen.add(question.id);
  questionHistory = { seen: [...seen], last: question.id, category: question.category };
  if (questionStorageAvailable) {
    try {
      window.localStorage.setItem(QUESTION_STORAGE.seen, JSON.stringify(questionHistory.seen));
      window.localStorage.setItem(QUESTION_STORAGE.last, question.id);
      window.localStorage.setItem(QUESTION_STORAGE.category, question.category);
    } catch {
      // Do not read a stale persisted history again after a failed write.
      questionStorageAvailable = false;
    }
  }
  return question;
}
function felixQuip(percent,correct) {
  const tier=percent>=75?2:percent>=40?1:0;
  const jokes=[
    [ 'Ni al vaso ni a la pregunta. Menos mal que la fregona no hace exámenes.', 'Hoy estudió más el suelo que tú: se llevó la sidra y tú los deberes.' ],
    [ 'La sidra, a medias. La respuesta, de vacaciones. Vamos a necesitar otro culín.', 'Algo entró en el vaso. En la cabeza, esa lección todavía no.' ],
    [ 'Tiras bien la sidra, pero no estudiaste mucho, no. A ver si el libro venía sin abridor.', 'La muñeca, de matrícula. La teoría… te la guardamos para septiembre.' ],
    [ 'Sabes de Asturias, pero estás escanciando para las baldosas.', 'La respuesta, perfecta. Ahora explica al suelo que la sidra era para el vaso.' ],
    [ 'La cabeza la tienes bien amueblada. A la muñeca le falta apretar un tornillo.', 'Aprobaste la teoría. En las prácticas aún salpicas al tribunal.' ],
    [ '¡Sidra dentro y respuesta buena! Deja algo para los demás, ho.', 'Tú vales para llevar el chigre y ganar el concurso de la tele.' ]
  ];
  const choices=jokes[tier+(correct?3:0)];return choices[Math.floor(Math.random()*choices.length)];
}
function showQuestion() {
  state.question=getNextQuestion();state.answered=false;
  ui.quiz.hidden=false;ui.summary.hidden=true;
  ui.question.textContent=state.question.question;
  state.question.answers.forEach((option,i)=>{ui['option-'+i].textContent=option;ui['option-'+i].disabled=false;});
  ui.result.hidden=false;ui.result.scrollTop=0;
  ui.question.focus({preventScroll:true});
}
function answerQuestion(index) {
  if(!state.done||!state.question||state.answered||!Number.isInteger(index)||index<0||index>3)return;
  state.answered=true;
  const correct=index===state.question.correctAnswer, percent=Math.round(100*state.caught/total);
  for(let i=0;i<4;i++)ui['option-'+i].disabled=true;
  ui['final-caught'].textContent=percent+'%';ui['final-spilled'].textContent=(100-percent)+'%';
  ui.verdict.textContent=correct?'✓ ¡Esa ye!':'✗ Nun ye esa.';
  ui['answer-detail'].textContent=(correct?'Respuesta correcta: ':'La respuesta correcta era ')+state.question.answers[state.question.correctAnswer]+'.';
  ui['answer-comment'].textContent=state.question.comment;
  ui.quip.textContent='«'+felixQuip(percent,correct)+'»';
  ui['answer-source'].href=state.question.source;
  ui.quiz.hidden=true;ui.summary.hidden=false;ui.result.scrollTop=0;
  ui.verdict.focus({preventScroll:true});
}
let state, lastTime = 0, accumulator = 0;
let audioPrepared=false;
function reset() {
  state = { glassX: 290, time: 0, phase:Math.random()*Math.PI*2, emitted: 0, caught: 0, spilled: 0, drops: [], splashes: [], holding: false, pointer: null, offset: 0, started: false, done: false, question:null, answered:false, keys: new Set(), flash: 0 };
  sound.pour(false,false); accumulator = 0; ui.result.hidden = true; ui['start-panel'].hidden=audioPrepared; ui.quiz.hidden=true;ui.summary.hidden=true; updateUI(); draw();
}
function clamp(x,a,b) { return Math.max(a,Math.min(b,x)); }
// A small, predictable motion, not wind. The neck and stream move together.
function pourSway(){return .68*Math.sin(state.time*3.7+state.phase)+.32*Math.sin(state.time*7.4+state.phase*.7);}
function bottlePose() { return { x:110,y:107,angle:.3+.25*pourSway() }; }
function streamVelocity(m) {
  const target=(SETTINGS.minX+SETTINGS.maxX)/2+((SETTINGS.maxX-SETTINGS.minX)/2+SETTINGS.glassWidth/2-4)*pourSway();
  const flight=(-125+Math.sqrt(125**2+2*680*(SETTINGS.glassY-m.y)))/680;
  return (target-m.x)/flight;
}
function mouth(p) { return { x:p.x + Math.cos(p.angle)*76, y:p.y + Math.sin(p.angle)*76 }; }
function updateUI() {
  ui.remaining.style.width = `${100 * (1-state.emitted/total)}%`;
  ui['pour-state'].textContent = state.done ? 'SERVIDO' : state.holding && state.emitted<total ? 'VIRTIENDO' : state.started ? 'EN PAUSA' : 'LISTO';
  ui.caught.innerHTML = `${Math.round(state.caught/total*100)}<span>%</span>`;
  ui.spilled.innerHTML = `${(state.done?100-Math.round(state.caught/total*100):Math.round(state.spilled/total*100))}<span>%</span>`;
}
function splash(x,y,good) {
  for(let i=0;i<3;i++) state.splashes.push({x,y,vx:(Math.random()-.5)*95,vy:-40-Math.random()*65,life:.26+Math.random()*.18,good});
}
function step(dt) {
  if(state.done) return;
  if(state.keys.has('ArrowLeft')) state.glassX -= 180*dt;
  if(state.keys.has('ArrowRight')) state.glassX += 180*dt;
  state.glassX = clamp(state.glassX,SETTINGS.minX,SETTINGS.maxX);
  const pouring = state.holding && state.emitted < total;
  if(pouring) {
    state.started = true; state.time += dt;
    // Integer particles conserve every drop: caught + spilled = emitted after settling.
    accumulator += dt * SETTINGS.rate;
    while(accumulator >= 1 && state.emitted < total) {
      accumulator--; state.emitted++;
      const p=bottlePose(), m=mouth(p);
      state.drops.push({x:m.x,y:m.y,vx:streamVelocity(m),vy:125,judged:false});
    }
  }
  for(const d of state.drops) {
    const oldY=d.y; d.vy+=680*dt; d.x+=d.vx*dt; d.y+=d.vy*dt;
    if(!d.judged && oldY<SETTINGS.glassY && d.y>=SETTINGS.glassY) {
      const hitX=d.x-d.vx*dt*(d.y-SETTINGS.glassY)/(d.y-oldY);
      d.judged=true;
      if(Math.abs(hitX-state.glassX)<SETTINGS.glassWidth/2-4) {
        state.caught++; d.remove=true; state.flash=.12;
        if(state.caught%5===0) splash(hitX,SETTINGS.glassY,true);
      } else { state.spilled++; }
    }
    if(d.y>509) {d.remove=true;if(state.spilled%3===0)splash(d.x,509,false);sound.splash();}
  }
  state.drops=state.drops.filter(d=>!d.remove);
  for(const s of state.splashes) {s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=350*dt;}
  state.splashes=state.splashes.filter(s=>s.life>0);state.flash=Math.max(0,state.flash-dt);
  if(state.emitted===total && state.drops.length===0 && state.splashes.length===0) {
    state.done=true;state.holding=false;state.keys.clear();sound.pour(false,false);sound.finish();
    showQuestion();
  }
}
// PROVISIONAL ART: replace drawFelix(), drawBottle(), and drawGlass() with final assets.
// Keep bottlePose()/mouth() and the glass opening at (state.glassX, SETTINGS.glassY).
function path(points,fill,stroke='#344339',width=3) {
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function line(points,color,width) {ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function ellipse(x,y,rx,ry,fill,stroke) {ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function drawFelix() {
  const skin='#eab087',ink='#344339';
  ellipse(126,513,96,13,'#d0d6be');
  line([[104,422],[95,482]],'#3d4242',32);line([[152,423],[163,484]],'#3d4242',32);
  ellipse(81,498,32,13,'#645342',ink);ellipse(174,500,30,13,'#645342',ink);
  // Raised arm also has two fixed segments; bottle rotates around the hand.
  const highShoulder={x:105,y:282}, highHand={x:110,y:107};
  const highElbow=solveArm(highShoulder,highHand,92,91,-1);
  line([[105,282],[highElbow.x,highElbow.y]],ink,33);
  line([[105,282],[highElbow.x,highElbow.y]],'#f6f2e6',27);
  line([[highElbow.x,highElbow.y],[110,107]],ink,25);
  line([[highElbow.x,highElbow.y],[110,107]],skin,20);
  ellipse(highElbow.x,highElbow.y,14,10,'#f6f2e6',ink);
  path([[99,269],[146,258],[173,290],[181,373],[78,378],[81,294]],'#f9f5e9');
  path([[93,274],[119,302],[137,271],[157,280],[172,374],[83,373]],'#343f3b');
  path([[112,275],[120,302],[132,275]],'#f9f5e9',null);
  path([[85,355],[172,355],[187,447],[71,447]],'#426448');
  line([[85,365],[171,365]],'#2d4b37',8);line([[120,376],[113,426]],'#587854',3);
  line([[152,310],[152,328]],'#deb953',3);line([[144,317],[160,317]],'#deb953',3);
  ellipse(119,240,14,30,skin,ink);
  ellipse(117,216,34,43,skin,ink);
  path([[88,221],[79,205],[82,189],[92,175],[107,171],[110,165],[118,171],[135,168],[146,184],[148,199],[137,193],[127,180],[111,188],[101,180],[91,204]],'#f7f6ee','#c8cabe',2);
  line([[94,208],[110,208]],'#f7f6ee',4);line([[120,207],[133,210]],'#f7f6ee',4);
  ctx.fillStyle='#39443ecc';ctx.fillRect(88,213,24,16);ctx.fillRect(119,214,24,16);
  ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(88,213,24,16);ctx.strokeRect(119,214,24,16);line([[112,218],[119,218]],ink,3);
  ellipse(104,220,2,3,ink);ellipse(130,221,2,3,ink);
  line([[116,222],[111,234],[119,235]],'#ba7f5c',2);
  ellipse(117,246,14,8,'#684d3f');
  path([[96,243],[103,235],[115,237],[119,234],[131,241],[137,247],[123,242],[116,243],[107,240]],'#f7f6ee',null);
  // IK: the wrist is attached to the glass, never a stretched polyline.
  const hand={x:state.glassX+ARM.wristX,y:SETTINGS.glassY+ARM.wristY};
  const elbow=solveArm(ARM.shoulder,hand,ARM.upper,ARM.lower,ARM.bend);
  const shoulder=[ARM.shoulder.x,ARM.shoulder.y], joint=[elbow.x,elbow.y];
  line([shoulder,joint],ink,33);line([shoulder,joint],'#f6f2e6',27);
  line([joint,[hand.x,hand.y]],ink,24);line([joint,[hand.x,hand.y]],skin,19);
  ellipse(elbow.x,elbow.y,14,10,'#f6f2e6',ink);
  ellipse(hand.x,hand.y,11,10,skin,ink);
}
function drawBottle() {
  const p=bottlePose();ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.scale(.82,.82);
  path([[-48,-22],[34,-22],[47,-15],[54,-8],[88,-8],[88,8],[54,8],[47,15],[34,22],[-48,22],[-53,14],[-53,-14]],'#42662e','#283f27');
  line([[-40,-13],[28,-13]],'#8fa56c',5);
  path([[-12,-19],[16,-19],[16,19],[-12,19]],'#e7db9d',null);
  ctx.fillStyle='#42662e';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('S',2,4);
  path([[85,-10],[93,-10],[93,10],[85,10]],'#304b28');ctx.restore();
  ellipse(p.x,p.y+10,13,9,'#eab087','#344339');
  line([[p.x-5,p.y+5],[p.x+6,p.y+10]],'#c88f69',2);
}
function drawGlass() {
  const x=state.glassX,y=SETTINGS.glassY;
  ctx.save();ctx.translate(x,y);ctx.scale(SETTINGS.glassWidth/48,1);ctx.translate(-x,-y);
  path([[x-24,y],[x+24,y],[x+18,y+52],[x-18,y+52]],'#f7fbec99','#6d8675',2);
  const level=state.caught/total*40;
  if(level>0){path([[x-18,y+48],[x+18,y+48],[x+18+level*.1,y+48-level],[x-18-level*.1,y+48-level]],'#e3b63e',null);ellipse(x,y+48-level,18+level*.1,3,'#f8dc78');}
  ellipse(x,y,24,5,state.flash>0?'#fff4b5':'#edf3df77',state.flash>0?'#bd922c':'#6d8675');
  line([[x-17,y+10],[x-14,y+32]],'#ffffffbb',3);
  ctx.restore();ctx.save();
  // Fingers over the lower edge.
  line([[x-22,y+36],[x-13,y+43],[x+1,y+43]],'#eab087',9);
  if(!state.started){ctx.setLineDash([3,5]);ctx.strokeStyle='#8a9a79';ctx.lineWidth=1;ctx.strokeRect(x-35,y-15,70,92);ctx.setLineDash([]);}
  ctx.restore();
}
function draw() {
  ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);
  ellipse(219,248,161,198,'#f2f1df');
  line([[22,510],[378,510]],'#ccd3ba',1);
  if(state.spilled) ellipse(268,515,12+state.spilled/total*75,3+state.spilled/total*8,'#dcb95066');
  drawFelix();drawBottle();
  for(const d of state.drops) line([[d.x-d.vx*.01,d.y-d.vy*.01],[d.x,d.y]],'#e3b439',3);
  drawGlass();
  for(const s of state.splashes) ellipse(s.x,s.y,1.8,2.4,s.good?'#f2cb55':'#d7aa39');
  ctx.textAlign='center';ctx.fillStyle='#758167';ctx.font='10px Arial';
  if(!state.started){ctx.fillText('←  MUEVE EL VASO  →',state.glassX,465);}
}
// Account for object-fit letterboxing on short screens, not just the element bounds.
function localPoint(event) {
  const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/W,r.height/H);
  return {x:(event.clientX-r.left-(r.width-W*scale)/2)/scale,y:(event.clientY-r.top-(r.height-H*scale)/2)/scale};
}
canvas.addEventListener('pointerdown',e=>{
  if(!audioPrepared||state.done||state.pointer!==null||e.button!==0)return;
  const p=localPoint(e);if(Math.abs(p.x-state.glassX)>55||Math.abs(p.y-(SETTINGS.glassY+30))>70)return;
  e.preventDefault();canvas.focus({preventScroll:true});state.pointer=e.pointerId;state.offset=state.glassX-p.x;state.holding=true;sound.pour(state.emitted<total,false);sound.unlock();canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{if(state.pointer===e.pointerId)state.glassX=clamp(localPoint(e).x+state.offset,SETTINGS.minX,SETTINGS.maxX);});
function release(){state.holding=false;state.pointer=null;state.keys.clear();sound.pour(false,false);}
// Touch activation may be granted only when the finger is lifted.
canvas.addEventListener('pointerup',()=>sound.unlock());
canvas.addEventListener('touchstart',()=>sound.unlock(),{passive:true});
canvas.addEventListener('touchend',()=>sound.unlock(),{passive:true});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(e.pointerId===state.pointer)release();});
window.addEventListener('blur',()=>{release();sound.pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){release();sound.pause();}lastTime=0;});
canvas.addEventListener('keydown',e=>{if(!audioPrepared)return;if(['ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();sound.unlock();state.keys.add(e.code);if(e.code==='Space'&&!state.done)state.holding=true;}});
canvas.addEventListener('keyup',e=>{state.keys.delete(e.code);if(e.code==='Space')state.holding=false;});
canvas.addEventListener('blur',release);
function beginPlay(withAudio) {
  if(!withAudio){sound.enabled=false;sound.pour(false,false);audioPrepared=true;ui['start-panel'].hidden=true;canvas.focus({preventScroll:true});return;}
  sound.enabled=true;ui['start-message'].textContent='Activando sonido…';
  // The native button click is an activation gesture before any pouring starts.
  const ready=sound.unlock();
  const timeout=new Promise(resolve=>setTimeout(()=>resolve(false),1800));
  return Promise.race([ready,timeout]).then(ok=>{
    if(ok){sound.finish();audioPrepared=true;ui['start-panel'].hidden=true;canvas.focus({preventScroll:true});}
    else {ui['start-message'].textContent='El navegador no activó el audio. Puedes reintentarlo o jugar sin sonido.';ui['start-silent'].hidden=false;}
  });
}
ui['start-audio'].addEventListener('click',()=>beginPlay(true));
ui['start-silent'].addEventListener('click',()=>beginPlay(false));
ui['audio-test'].addEventListener('click',()=>{
  sound.enabled=true;release();sound.pause();
  sound.unlock().then(ready=>{
    if(ready){sound.finish();ui['audio-test'].textContent='Probar sonido';}
    else ui['audio-test'].textContent='Reintentar sonido';
  });
});
for(let i=0;i<4;i++)ui['option-'+i].addEventListener('click',()=>answerQuestion(i));
ui.again.addEventListener('click',()=>{sound.unlock();reset();canvas.focus({preventScroll:true});});
function frame(now){const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;let left=dt;while(left>0){const delta=Math.min(left,1/120);step(delta);left-=delta;}sound.pour(state.holding&&!state.done&&state.emitted<total,state.flash>0);updateUI();draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
