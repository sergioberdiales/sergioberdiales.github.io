'use strict';
// Tuning: one horizontal drag, 6 seconds of actual pouring, a gently swaying wrist.
const SETTINGS = { duration: 6, rate: 100, glassY: 368, glassWidth: 48, minX: 157, maxX: 321 };
const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const ui = Object.fromEntries(['remaining','pour-state','caught','spilled','result','final-caught','final-spilled','again','hint'].map(id => [id, document.getElementById(id)]));
const W = 400, H = 560, total = SETTINGS.duration * SETTINGS.rate;
let state, lastTime = 0, accumulator = 0;
function reset() {
  state = { glassX: 235, time: 0, emitted: 0, caught: 0, spilled: 0, drops: [], splashes: [], holding: false, pointer: null, offset: 0, started: false, done: false, keys: new Set(), flash: 0 };
  accumulator = 0; ui.result.hidden = true; updateUI(); draw();
}
function clamp(x,a,b) { return Math.max(a,Math.min(b,x)); }
// A small, predictable motion, not wind. The neck and stream move together.
function bottlePose() { return { x: 136, y: 101, angle: .35 + .29 * Math.sin(state.time * 1.55) + .09 * Math.sin(state.time * 3.1) }; }
function mouth(p) { return { x:p.x + Math.cos(p.angle)*91, y:p.y + Math.sin(p.angle)*91 }; }
function updateUI() {
  ui.remaining.style.width = `${100 * (1-state.emitted/total)}%`;
  ui['pour-state'].textContent = state.done ? 'SERVIDO' : state.holding && state.emitted<total ? 'VIRTIENDO' : state.started ? 'EN PAUSA' : 'LISTO';
  ui.caught.innerHTML = `${Math.round(state.caught/total*100)}<span>%</span>`;
  ui.spilled.innerHTML = `${Math.round(state.spilled/total*100)}<span>%</span>`;
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
      state.drops.push({x:m.x,y:m.y,vx:20+(p.angle-.3)*260,vy:125,judged:false});
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
    if(d.y>509) {d.remove=true;if(state.spilled%3===0)splash(d.x,509,false);}
  }
  state.drops=state.drops.filter(d=>!d.remove);
  for(const s of state.splashes) {s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=350*dt;}
  state.splashes=state.splashes.filter(s=>s.life>0);state.flash=Math.max(0,state.flash-dt);
  if(state.emitted===total && state.drops.length===0 && state.splashes.length===0) {
    state.done=true;state.holding=false;state.keys.clear();
    const percent=Math.round(100*state.caught/total);
    ui['final-caught'].textContent=`${percent}%`;ui['final-spilled'].textContent=`${100-percent}%`;
    ui.result.hidden=false;ui.again.focus({preventScroll:true});
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
  // Raised arm and palm holding the bottle.
  line([[105,282],[70,216],[103,112]],ink,33);line([[105,282],[70,216],[103,112]],'#f6f2e6',27);
  line([[76,192],[103,112]],ink,25);line([[76,192],[103,112]],skin,20);
  ellipse(110,107,18,12,skin,ink);
  path([[99,269],[146,258],[173,290],[181,373],[78,378],[81,294]],'#f9f5e9');
  path([[93,274],[119,302],[137,271],[157,280],[172,374],[83,373]],'#343f3b');
  path([[112,275],[120,302],[132,275]],'#f9f5e9',null);
  path([[85,355],[172,355],[187,447],[71,447]],'#426448');
  line([[85,365],[171,365]],'#2d4b37',8);line([[120,376],[113,426]],'#587854',3);
  line([[152,310],[152,328]],'#deb953',3);line([[144,317],[160,317]],'#deb953',3);
  ellipse(119,240,14,30,skin,ink);
  ellipse(117,216,34,43,skin,ink);ellipse(146,219,10,13,skin,ink);
  path([[88,221],[79,205],[82,189],[92,175],[107,171],[110,165],[118,171],[135,168],[146,184],[148,199],[137,193],[127,180],[111,188],[101,180],[91,204]],'#f7f6ee','#c8cabe',2);
  ellipse(147,216,5,8,skin);
  line([[94,208],[110,208]],'#f7f6ee',4);line([[120,207],[133,210]],'#f7f6ee',4);
  ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(88,213,24,16);ctx.strokeRect(119,214,24,16);line([[112,218],[119,218]],ink,3);
  ellipse(104,220,2,3,ink);ellipse(130,221,2,3,ink);
  line([[116,222],[111,234],[119,235]],'#ba7f5c',2);
  ellipse(117,246,14,8,'#684d3f');
  path([[96,243],[103,235],[115,237],[119,234],[131,241],[137,247],[123,242],[116,243],[107,240]],'#f7f6ee',null);
  // Lower arm follows the glass, making the actual controlled object explicit.
  line([[155,288],[180,334]],ink,31);line([[155,288],[180,334]],'#f6f2e6',25);
  line([[180,334],[169,372],[state.glassX-15,414]],ink,23);
  line([[180,334],[169,372],[state.glassX-15,414]],skin,18);
}
function drawBottle() {
  const p=bottlePose();ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);
  path([[-48,-22],[34,-22],[47,-15],[54,-8],[88,-8],[88,8],[54,8],[47,15],[34,22],[-48,22],[-53,14],[-53,-14]],'#42662e','#283f27');
  line([[-40,-13],[28,-13]],'#8fa56c',5);
  path([[-12,-19],[16,-19],[16,19],[-12,19]],'#e7db9d',null);
  ctx.fillStyle='#42662e';ctx.font='bold 9px Arial';ctx.textAlign='center';ctx.fillText('S',2,4);
  path([[85,-10],[93,-10],[93,10],[85,10]],'#304b28');ctx.restore();
}
function drawGlass() {
  const x=state.glassX,y=SETTINGS.glassY;
  ctx.save();
  path([[x-24,y],[x+24,y],[x+18,y+52],[x-18,y+52]],'#f7fbec99','#6d8675',2);
  const level=state.caught/total*40;
  if(level>0){path([[x-18,y+48],[x+18,y+48],[x+18+level*.1,y+48-level],[x-18-level*.1,y+48-level]],'#e3b63e',null);ellipse(x,y+48-level,18+level*.1,3,'#f8dc78');}
  ellipse(x,y,24,5,state.flash>0?'#fff4b5':'#edf3df77',state.flash>0?'#bd922c':'#6d8675');
  line([[x-17,y+10],[x-14,y+32]],'#ffffffbb',3);
  // Fingers over the lower edge.
  line([[x-23,y+47],[x-14,y+53],[x+2,y+53]],'#eab087',9);
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
  if(state.done||state.pointer!==null||e.button!==0)return;
  const p=localPoint(e);if(Math.abs(p.x-state.glassX)>55||Math.abs(p.y-(SETTINGS.glassY+30))>70)return;
  e.preventDefault();canvas.focus({preventScroll:true});state.pointer=e.pointerId;state.offset=state.glassX-p.x;state.holding=true;canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{if(state.pointer===e.pointerId)state.glassX=clamp(localPoint(e).x+state.offset,SETTINGS.minX,SETTINGS.maxX);});
function release(){state.holding=false;state.pointer=null;state.keys.clear();}
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,release);
window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();lastTime=0;});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();state.keys.add(e.code);if(e.code==='Space'&&!state.done)state.holding=true;}});
canvas.addEventListener('keyup',e=>{state.keys.delete(e.code);if(e.code==='Space')state.holding=false;});
ui.again.addEventListener('click',()=>{reset();canvas.focus({preventScroll:true});});
function frame(now){const dt=lastTime?Math.min((now-lastTime)/1000,.05):0;lastTime=now;let left=dt;while(left>0){const delta=Math.min(left,1/120);step(delta);left-=delta;}updateUI();draw();requestAnimationFrame(frame);}
reset();requestAnimationFrame(frame);
