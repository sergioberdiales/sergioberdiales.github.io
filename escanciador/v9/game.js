'use strict';
// Tuning: one horizontal drag, 6 seconds of actual pouring, a gently swaying wrist.
const SETTINGS = { duration: 6, rate: 100, glassY: 350, glassWidth: 48, minX: 270, maxX: 318 };
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const ui = Object.fromEntries(['remaining','pour-state','caught','spilled','result','final-caught','final-spilled','again','hint','audio-test','quiz','summary','question','verdict','answer-detail','quip','answer-source','option-0','option-1','option-2','option-3','start-panel','start-audio','start-silent','start-message'].map(id => [id, document.getElementById(id)]));
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
// Four choices, one correct answer. Sources are shown only after answering.
const QUESTIONS = [
  {
    "text": "¿Qué rey trasladó la corte asturiana a Pravia en el año 774?",
    "options": [
      "Alfonso II",
      "Silo",
      "Ramiro I",
      "Fruela II"
    ],
    "answer": 1,
    "fact": "Silo y la reina Adosinda trasladaron la corte a Pravia en 774.",
    "source": "https://www.ayto-pravia.es/historia"
  },
  {
    "text": "¿Qué monarca mandó construir San Salvador de Valdediós?",
    "options": [
      "Alfonso I",
      "Ramiro I",
      "Alfonso III",
      "Ordoño II"
    ],
    "answer": 2,
    "fact": "San Salvador de Valdediós fue construido por iniciativa de Alfonso III.",
    "source": "https://www.turismoasturias.es/en/descubre/cultura/prerromanico/iglesia-de-san-salvador-de-valdedios"
  },
  {
    "text": "¿En qué año se descubrió la cueva de Tito Bustillo?",
    "options": [
      "1879",
      "1924",
      "1957",
      "1968"
    ],
    "answer": 3,
    "fact": "Un grupo de jóvenes espeleólogos descubrió Tito Bustillo en 1968.",
    "source": "https://yacimientos.asturias.es/cueva-de-tito-bustillo"
  },
  {
    "text": "¿En qué concejo está el conjunto etnográfico de Os Teixóis?",
    "options": [
      "Taramundi",
      "Boal",
      "Grandas de Salime",
      "Villanueva de Oscos"
    ],
    "answer": 0,
    "fact": "Os Teixóis está en Taramundi y conserva varios ingenios hidráulicos.",
    "source": "https://www.taramundi.es/conjunto-etnografico-de-teixois"
  },
  {
    "text": "¿Para qué servía el batán que se conserva en Os Teixóis?",
    "options": [
      "Moler cereal",
      "Afilar cuchillos",
      "Golpear y abatanar tejidos",
      "Prensar manzanas"
    ],
    "answer": 2,
    "fact": "El batán utilizaba mazos movidos por agua para golpear los tejidos.",
    "source": "https://www.taramundi.es/conjunto-etnografico-de-teixois"
  },
  {
    "text": "¿A qué concejo pertenece el cabo de Peñas?",
    "options": [
      "Carreño",
      "Gozón",
      "Castrillón",
      "Muros de Nalón"
    ],
    "answer": 1,
    "fact": "El cabo de Peñas y su centro de interpretación están en Gozón.",
    "source": "https://www.turismoasturias.es/descubre/cultura/museos-y-espacios-culturales/otros-espacios/centro-de-recepcion-de-visitantes-e-interpretacion-del-medio-marino-de-penas"
  },
  {
    "text": "¿En qué concejo está la villa marinera de Llastres?",
    "options": [
      "Villaviciosa",
      "Ribadesella",
      "Caravia",
      "Colunga"
    ],
    "answer": 3,
    "fact": "Llastres pertenece al concejo de Colunga.",
    "source": "https://www.turismoasturias.es/descubre/costa/villas-marineras/marinera-lastres"
  },
  {
    "text": "¿Qué dramaturgo nació en Bisuyu, en Cangas del Narcea?",
    "options": [
      "Alejandro Casona",
      "Ramón Pérez de Ayala",
      "Armando Palacio Valdés",
      "Leopoldo Alas, Clarín"
    ],
    "answer": 0,
    "fact": "Alejandro Casona nació en Bisuyu, en el concejo de Cangas del Narcea.",
    "source": "https://www.turismoasturias.es/en/turismo-rural/occidente/itinerario3"
  }
];
let questionBag=[], previousQuestion=-1;
function nextQuestion() {
  if(!questionBag.length){
    questionBag=QUESTIONS.map((_,i)=>i);
    for(let i=questionBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questionBag[i],questionBag[j]]=[questionBag[j],questionBag[i]];}
    if(questionBag[questionBag.length-1]===previousQuestion)[questionBag[0],questionBag[questionBag.length-1]]=[questionBag[questionBag.length-1],questionBag[0]];
  }
  previousQuestion=questionBag.pop();return QUESTIONS[previousQuestion];
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
  state.question=nextQuestion();state.answered=false;
  ui.quiz.hidden=false;ui.summary.hidden=true;
  ui.question.textContent=state.question.text;
  state.question.options.forEach((option,i)=>{ui['option-'+i].textContent=option;ui['option-'+i].disabled=false;});
  ui.result.hidden=false;ui.result.scrollTop=0;
  ui.question.focus({preventScroll:true});
}
function answerQuestion(index) {
  if(!state.done||!state.question||state.answered||!Number.isInteger(index)||index<0||index>3)return;
  state.answered=true;
  const correct=index===state.question.answer, percent=Math.round(100*state.caught/total);
  for(let i=0;i<4;i++)ui['option-'+i].disabled=true;
  ui['final-caught'].textContent=percent+'%';ui['final-spilled'].textContent=(100-percent)+'%';
  ui.verdict.textContent=correct?'¡Acertaste, ho!':'Esa no era, ho…';
  ui['answer-detail'].textContent=(correct?'Respuesta correcta. ':'Elegiste «'+state.question.options[index]+'». ')+state.question.fact;
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
function pourSway(){return .68*Math.sin(state.time*2.9+state.phase)+.32*Math.sin(state.time*5.8+state.phase*.7);}
function bottlePose() { return { x:110,y:107,angle:.3+.19*pourSway() }; }
function streamVelocity(m) {
  const target=(SETTINGS.minX+SETTINGS.maxX)/2+((SETTINGS.maxX-SETTINGS.minX)/2+SETTINGS.glassWidth/2-6)*pourSway();
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
