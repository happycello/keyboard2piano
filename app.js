'use strict';
const $=id=>document.getElementById(id);
const rows=[['1234567890-=', ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal']],['QWERTYUIOP[]',['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight']],["ASDFGHJKL;'",['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote']],['ZXCVBNM,./',['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash']]];
const pitchKeys=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];

const names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'], degrees=[0,2,4,5,7,9,11];
let mode='main',base=24,ctx,master,compressor,enabled=false,loading=false,statusKey='initial',audioTask,inputEpoch=0,wheelRemainder=0;
const pointerSessions=new Map();
let sampleBuffers=new Map(),instrumentId='piano';const bankCache=new Map();const held=new Set(),voices=new Map(),allVoices=new Set(),pedal={quiet:false,soft:false,sustain:false},latches={quiet:false,soft:false,sustain:false};
const noteName=n=>names[n%12]+(Math.floor(n/12)-1), black=n=>[1,3,6,8,10].includes(n%12);
function mapping(code){
  if(mode==='num'){
    const d=Number(code.replace(/^(Numpad|Digit)/,''));
    return /^(Numpad|Digit)[1-7]$/.test(code)?base+degrees[d-1]+(held.has('ArrowRight')?1:0)-(held.has('ArrowLeft')?1:0)+12*((held.has('ArrowUp')?1:0)-(held.has('ArrowDown')?1:0)):null;
  }
  let offset=0;
  for(const [,codes] of [...rows].reverse()){
    const i=codes.indexOf(code);
    if(i>=0){const d=offset+i;return base+Math.floor(d/7)*12+degrees[d%7]+(held.has('ShiftLeft')||held.has('ShiftRight')?1:0);}
    offset+=codes.length;
  }
  return null;
}
function updateStatus(){ $('status').textContent=tr(statusKey);$('start').textContent=tr(loading?'loading':enabled?'started':'start');$('start').disabled=loading;$('voice').disabled=loading;updateInputStatus(); }
async function audio(){
  if(loading)return audioTask;
  if(!ctx){
    ctx=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});ctx.onstatechange=()=>updateStatus();
    master=ctx.createGain();compressor=ctx.createDynamicsCompressor();
    compressor.threshold.value=-10;compressor.knee.value=12;compressor.ratio.value=4;
    master.connect(compressor);compressor.connect(ctx.destination);volume();
  }
  loading=true;updateStatus();
  audioTask=(async()=>{
    await ctx.resume();
    if(!sampleBuffers.size){
      const entries=Object.entries(instrumentId==='piano'?(window.PIANO_SAMPLES||{}):(window.INSTRUMENT_SAMPLES?.[instrumentId]||{}));
      if(!entries.length)throw Error('Missing piano samples');
      const decoded=await Promise.all(entries.map(async([n,data])=>{
        const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
        return [+n,await ctx.decodeAudioData(bytes.buffer)];
      }));
      decoded.forEach(([n,buffer])=>sampleBuffers.set(n,buffer));bankCache.set(instrumentId,sampleBuffers);
    }
    enabled=true;statusKey='ready';
  })();
  try{await audioTask;}catch(error){enabled=false;statusKey='error';throw error;}
  finally{loading=false;updateStatus();}
}
function toneCutoff(){return Math.min(ctx?ctx.sampleRate*.45:20000,Number($('brightness').value)*(pedal.soft?.42:1));}
function updateTone(){if(ctx)for(const v of allVoices)v.filter.frequency.setTargetAtTime(toneCutoff(),ctx.currentTime,.04);}
function volume(){$('volumeValue').textContent=$('volume').value+'%';updateInputStatus();if(master)master.gain.setTargetAtTime(Number($('volume').value)/100*(pedal.quiet?.3:1)*.85,ctx.currentTime,.025);}
function play(id,n,inputCode=null){
  if(window.transcriber?.active)return;
  if(!enabled||ctx.state!=='running'||voices.has(id))return;
  if(allVoices.size>=96)dispose(allVoices.values().next().value);
  const nearest=[...sampleBuffers.keys()].reduce((a,b)=>Math.abs(b-n)<Math.abs(a-n)?b:a);
  const source=ctx.createBufferSource();source.buffer=sampleBuffers.get(nearest);
  source.playbackRate.value=Math.pow(2,(n-nearest)/12);
  const t=ctx.currentTime,g=ctx.createGain(),filter=ctx.createBiquadFilter();
  filter.type='lowpass';filter.Q.value=.35;filter.frequency.value=toneCutoff();
  source.connect(filter);filter.connect(g);g.connect(master);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pedal.soft?.6:.9,t+.004);
  const v={id,n,inputCode,root:nearest,g,filter,os:[source],released:false};
  voices.set(id,v);allVoices.add(v);source.onended=()=>dispose(v);source.start(t);
  // The source ends naturally; its end time changes when playback rate changes.
  if(inputCode)$('lastSound').textContent=tr('lastSound',{note:noteName(n)});paint();window.lesson?.onNote(n,id);
}
function dispose(v){
  if(v.disposed)return;v.disposed=true;clearTimeout(v.timer);
  v.os.forEach(o=>{o.onended=null;try{o.stop();}catch{}o.disconnect();});
  v.g.disconnect();v.filter.disconnect();allVoices.delete(v);
  if(voices.get(v.id)===v)voices.delete(v.id);paint();
}
function decay(v){if(v.ending)return;v.ending=true;const t=ctx.currentTime;v.g.gain.cancelAndHoldAtTime(t);v.g.gain.setTargetAtTime(.00001,t,.09);clearTimeout(v.timer);v.timer=setTimeout(()=>dispose(v),600);}
function release(id,force=false){const v=voices.get(id);if(!v)return;voices.delete(id);v.released=true;if(force||!pedal.sustain)decay(v);paint();}
function pedals(){const old=pedal.sustain;pedal.quiet=latches.quiet||(held.has('ControlLeft')||held.has('ControlRight'));pedal.soft=latches.soft||held.has('AltLeft')||held.has('AltRight');pedal.sustain=latches.sustain||held.has('Space');if(old&&!pedal.sustain)for(const v of allVoices)if(v.released)decay(v);volume();updateTone();document.querySelectorAll('[data-pedal]').forEach(e=>{e.classList.toggle('active',pedal[e.dataset.pedal]);e.setAttribute('aria-pressed',String(pedal[e.dataset.pedal]));});}
function panic(){inputEpoch++;pointerSessions.clear();inputComposer.cancel();window.lesson?.pause();held.clear();Object.keys(latches).forEach(k=>latches[k]=false);for(const v of [...allVoices])dispose(v);pedals();paint();}
function paint(){const sounding=new Set([...allVoices].filter(v=>!v.ending).map(v=>v.n));document.querySelectorAll('[data-code]').forEach(e=>e.classList.toggle('active',held.has(e.dataset.code)));document.querySelectorAll('[data-note]').forEach(e=>e.classList.toggle('active',sounding.has(+e.dataset.note)));$('notes').textContent=[...sounding].sort((a,b)=>a-b).map(noteName).join(' · ')||'—';window.lesson?.paint();}
function mainKeyForNote(n){
  const entries=[...rows].reverse().flatMap(([labels,codes])=>codes.map((code,i)=>({code,label:labels[i]})));
  const natural=entries.map((key,i)=>({...key,n:base+Math.floor(i/7)*12+degrees[i%7]}));
  const plain=natural.find(k=>k.n===n);if(plain)return {...plain,shift:false,text:plain.label};
  const sharp=natural.find(k=>k.n+1===n);return sharp?{...sharp,shift:true,text:'Shift + '+sharp.label}:null;
}
function cap(label,code){const n=mapping(code);return `<button class="keycap ${n!==null&&black(n)?'black':''}" data-code="${code}" aria-label="${label} ${n===null?'':noteName(n)}"><b>${label}</b><small>${n===null?tr(code):noteName(n)}</small></button>`;}
function render(){const kb=$('keyboard');kb.innerHTML=mode==='main'?rows.map(([labels,codes])=>`<div class="keyrow">${codes.map((c,i)=>cap(labels[i],c)).join('')}</div>`).join(''):`<div class="number-layout"><div class="number-row"><small class="section-label">${tr('numberRow')}</small><div class="keyrow">${[1,2,3,4,5,6,7].map(d=>cap(d,'Digit'+d)).join('')}</div><div class="arrow-pad"><small class="section-label">${tr('arrows')}</small><div class="keyrow">${cap('↑','ArrowUp')}</div><div class="keyrow">${cap('←','ArrowLeft')}${cap('↓','ArrowDown')}${cap('→','ArrowRight')}</div></div></div><div class="numpad"><small class="section-label">${tr('numpad')}</small>${[[7,null,null],[4,5,6],[1,2,3]].map(r=>`<div class="keyrow">${r.map(d=>d===null?'<div class="keycap empty"></div>':cap(d,'Numpad'+d)).join('')}</div>`).join('')}</div></div>`;
const lo=mode==='main'?base:base-13,hi=mode==='main'?base+77:base+24;const ns=Array.from({length:hi-lo+1},(_,i)=>lo+i),white=ns.filter(n=>!black(n)),blackWidth=62/white.length;$('piano').style.minWidth=Math.max(780,white.length*24)+'px';$('piano').innerHTML=white.map(n=>`<button class="ivory" data-note="${n}" aria-label="${noteName(n)}"><span>${noteName(n)}</span></button>`).join('')+ns.filter(black).map(n=>`<button class="ebony" data-note="${n}" aria-label="${noteName(n)}" style="width:${blackWidth}%;left:${white.filter(w=>w<n).length/white.length*100-blackWidth/2}%"></button>`).join('');document.querySelectorAll('[data-pedal] small').forEach(e=>{if(e.parentElement.dataset.pedal==='quiet')e.textContent='CTRL';if(e.parentElement.dataset.pedal==='soft')e.textContent='ALT';});$('hint').textContent=mode==='main'?tr('mainHint',{lo:noteName(base),hi:noteName(base+77)}):tr('numHint');bindPointers();paint();}
function retuneVoice(id,n){
  const v=voices.get(id);if(!v||v.n===n)return;
  const rate=v.os[0].playbackRate,t=ctx.currentTime;
  rate.cancelAndHoldAtTime(t);rate.setTargetAtTime(Math.pow(2,(n-v.root)/12),t,.003);
  v.n=n;paint();window.lesson?.onNote(n,id);
}
const inputComposer=new KeyComposer({
  pitch:mapping,tolerance:()=>Number($('comboWindow').value),
  start:s=>{try{play(s.id,s.pitch,s.code);}catch{statusKey='keyboardError';updateStatus();}},end:s=>release(s.id),
  retune:s=>retuneVoice(s.id,s.pitch),changed:()=>render()
});
const modifiers=new Set(['ControlLeft','ControlRight','ShiftLeft','ShiftRight','AltLeft','AltRight','Space']);
function isPitchModifier(code){return mode==='main'?/^Shift(Left|Right)$/.test(code):pitchKeys.includes(code);}
function queueNote(code){try{inputComposer.noteOn(code);}catch{statusKey='keyboardError';updateStatus();}}
function press(code){
  if(held.has(code))return;held.add(code);if(mapping(code)!==null)$('lastKey').textContent=tr('lastKey',{key:code.replace('Key','').replace('Digit','').replace('Numpad','Num ')});
  if(modifiers.has(code))pedals();
  if(isPitchModifier(code)){inputComposer.modifierChange(true);render();}
  else if(mapping(code)!==null){
    if(window.transcriber?.active){updateInputStatus();return;}
    if(enabled&&ctx?.state==='running')queueNote(code);
    else {const epoch=inputEpoch;paint();return audio().then(()=>{if(epoch===inputEpoch&&held.has(code))queueNote(code);}).catch(()=>{statusKey='error';updateStatus();});}
  }
  paint();
}
function lift(code){
  held.delete(code);if(modifiers.has(code))pedals();
  if(isPitchModifier(code)){inputComposer.modifierChange(false);render();}
  else inputComposer.noteOff(code);
  paint();
}
function editingTarget(target){
  return !!target&&(target.isContentEditable||target.tagName==='TEXTAREA'||target.tagName==='SELECT'||(target.tagName==='INPUT'&&!['range','checkbox','button'].includes(target.type)));
}
function updateInputStatus(){
  const key=window.transcriber?.active?'inputBusy':loading?'inputLoading':editingTarget(document.activeElement)?'inputEditing':Number($('volume').value)===0?'inputMuted':enabled&&ctx?.state==='running'?'inputReady':'inputStart';
  $('inputStatus').textContent=tr(key);
}
function returnToKeyboard(){ $('instrumentBoard').focus({preventScroll:true});updateInputStatus(); }
function bindPointers(){document.querySelectorAll('[data-code],[data-note]').forEach(e=>{
  e.onpointerdown=async ev=>{
    ev.preventDefault();returnToKeyboard();
    const contact={code:e.dataset.code,note:Number(e.dataset.note)},epoch=inputEpoch;pointerSessions.set(ev.pointerId,contact);
    if(!enabled||ctx?.state!=='running'){try{await audio();}catch{statusKey='error';updateStatus();return;}}
    if(epoch!==inputEpoch||pointerSessions.get(ev.pointerId)!==contact)return;
    if(contact.code)press(contact.code);else play('pointer'+ev.pointerId,contact.note);
  };
});}
function finishPointer(event){
  const contact=pointerSessions.get(event.pointerId);pointerSessions.delete(event.pointerId);
  release('pointer'+event.pointerId);
  if(contact?.code&&!physical.has(contact.code)&&![...pointerSessions.values()].some(p=>p.code===contact.code))lift(contact.code);
  if(event.target?.tagName==='INPUT'&&event.target.type==='range'&&event.target.closest?.('.instrument .settings'))returnToKeyboard();
}
document.addEventListener('pointerup',finishPointer);document.addEventListener('pointercancel',()=>panic());
const physical=new Set();
function onKeyboardDown(e){
  if(e.key==='AltGraph'||(e.ctrlKey&&e.altKey&&!physical.has('ControlLeft')&&!physical.has('ControlRight')))return;
  if(e.code==='Escape'){panic();window.transcriber?.stop();updateInputStatus();return;}
  if(editingTarget(e.target)){updateInputStatus();return;}
  if(e.target.tagName==='INPUT'&&e.target.type==='range'&&/^(Arrow|Home|End|Page)/.test(e.code))return;
  if(e.target.tagName==='INPUT'&&e.target.type==='checkbox'&&e.code==='Space')return;
  const relevant=modifiers.has(e.code)||mapping(e.code)!==null||(mode==='num'&&pitchKeys.includes(e.code));
  if(!relevant)return;e.preventDefault();if(e.repeat)return;
  if(e.target.tagName==='INPUT')returnToKeyboard();physical.add(e.code);return press(e.code);
}
function onKeyboardUp(e){physical.delete(e.code);if(held.has(e.code)){e.preventDefault();lift(e.code);}}
document.addEventListener('keydown',onKeyboardDown,{capture:true});document.addEventListener('keyup',onKeyboardUp,{capture:true});
document.addEventListener('focusin',e=>{if(editingTarget(e.target)){panic();physical.clear();}updateInputStatus();});
function onVolumeWheel(e){
  const pedalCtrl=e.ctrlKey&&(physical.has('ControlLeft')||physical.has('ControlRight'));
  if(!$('wheelVolume').checked||(e.ctrlKey&&!pedalCtrl)||e.metaKey||Math.abs(e.deltaX||0)>Math.abs(e.deltaY||0)||!e.deltaY||e.cancelable===false)return;
  if(editingTarget(e.target)||e.target.tagName==='INPUT')return;
  e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?40:e.deltaMode===2?120:1);
  wheelRemainder-=Math.max(-240,Math.min(240,pixels))*.05;
  const step=wheelRemainder<0?Math.ceil(wheelRemainder):Math.floor(wheelRemainder);if(!step)return;
  wheelRemainder-=step;const previous=Number($('volume').value),next=Math.max(0,Math.min(100,previous+step));
  if(next===0||next===100)wheelRemainder=0;$('volume').value=String(next);volume();
}
$('instrumentBoard').addEventListener('wheel',onVolumeWheel,{passive:false});
$('wheelVolume').onchange=()=>{wheelRemainder=0;returnToKeyboard();};
$('keyboardFocus').onclick=returnToKeyboard;
function updateInstrumentBadge(){ $('soundBadge').textContent=tr('sampledVoice',{voice:tr(instrumentId+'Voice')}); }
$('voice').onchange=async()=>{returnToKeyboard();panic();instrumentId=$('voice').value;sampleBuffers=bankCache.get(instrumentId)||new Map();enabled=false;updateInstrumentBadge();try{await audio();}catch{}};
function octaveOptions(){ $('octave').innerHTML=[0,1,2,3,4,5].map(o=>`<option value="${12*(o+1)}" ${12*(o+1)===base?'selected':''}>C${o} · ${o===4?tr('middleC'):'do'}</option>`).join(''); }
function setMode(m){panic();physical.clear();mode=m;base=m==='main'?24:60;$('mainMode').classList.toggle('selected',m==='main');$('numMode').classList.toggle('selected',m==='num');$('mainMode').setAttribute('aria-pressed',String(m==='main'));$('numMode').setAttribute('aria-pressed',String(m==='num'));octaveOptions();render();}
$('mainMode').onclick=()=>setMode('main');$('numMode').onclick=()=>setMode('num');$('octave').onchange=()=>{returnToKeyboard();panic();base=+$('octave').value;render();};$('volume').oninput=()=>{wheelRemainder=0;volume();};$('brightness').oninput=updateTone;$('comboWindow').oninput=()=>{panic();$('comboValue').textContent=$('comboWindow').value+' ms';};$('stop').onclick=()=>{panic();window.transcriber?.stop();};$('start').onclick=()=>{returnToKeyboard();return audio().catch(()=>{statusKey='error';updateStatus();});};document.querySelectorAll('[data-pedal]').forEach(e=>e.onclick=()=>{latches[e.dataset.pedal]=!latches[e.dataset.pedal];pedals();});window.addEventListener('blur',()=>{panic();physical.clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden)panic();});
$('language').onclick=()=>{ language=language==='en'?'zh':'en';try{localStorage.setItem('keyboard2piano.language',language);}catch{}translatePage();octaveOptions();volume();updateStatus();updateInstrumentBadge();render();window.lesson?.localize();window.songLibrary?.localize();window.transcriber?.localize(); };
translatePage();setMode('main');volume();updateStatus();updateInstrumentBadge();
