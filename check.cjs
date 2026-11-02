const fs=require('fs'),vm=require('vm'),assert=require('assert');
const documentEvents=new Map();
const elements=new Map(),el=()=>({children:[],append(...items){this.children.push(...items);},replaceChildren(...items){this.children=[...items];},click(){this.onclick?.();},value:'65',checked:false,style:{},tagName:'DIV',type:'',dataset:{},textContent:'',innerHTML:'',classList:{toggle(){}},setAttribute(){},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){},scrollIntoView(){},focus(){sandbox.document.activeElement=this;for(const fn of documentEvents.get('focusin')||[])fn({target:this});}});
const pointerKey={...el(),tagName:'BUTTON',dataset:{note:'60'}};
const param=()=>({value:0,setTargetAtTime(v){this.value=v;},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(){},cancelAndHoldAtTime(){}});
const node=()=>({connect(){},disconnect(){},start(){},stop(){},gain:param(),frequency:param(),Q:param(),playbackRate:param(),threshold:param(),knee:param(),ratio:param()});
const sandbox={contexts:[],tracksStopped:0,timerCallbacks:[],navigator:{},performance:{now:()=>0},setInterval(fn){sandbox.timerCallbacks.push(fn);return 1;},clearInterval(){},atob,localStorage:{getItem(){return null;},setItem(){}},document:{createElement(tag){return {...el(),tagName:tag.toUpperCase()};},documentElement:{lang:'en'},querySelector(){return null;},getElementById(id){if(!elements.has(id))elements.set(id,el());return elements.get(id);},querySelectorAll(selector){return selector==='[data-code],[data-note]'?[pointerKey]:[];},addEventListener(name,fn){if(!documentEvents.has(name))documentEvents.set(name,[]);documentEvents.get(name).push(fn);}},window:{addEventListener(){},AudioContext:class{constructor(){sandbox.contexts.push(this);this.currentTime=0;this.state='running';this.sampleRate=44100;this.destination={};}createAnalyser(){return {...node(),getFloatTimeDomainData(data){for(let i=0;i<data.length;i++)data[i]=.2*Math.sin(2*Math.PI*440*i/44100);}};}createMediaStreamSource(){return node();}createGain(){return node();}createDynamicsCompressor(){return node();}createBufferSource(){return node();}async decodeAudioData(){return {duration:1,sampleRate:44100,numberOfChannels:1,getChannelData(){return Float32Array.from({length:44100},(_,i)=>.2*Math.sin(2*Math.PI*440*i/44100));}};}async close(){}createBiquadFilter(){return node();}async resume(){this.state='running';}}},setTimeout(fn,ms){if(ms===0)queueMicrotask(fn);return 1;},clearTimeout(){}};
for(const match of fs.readFileSync(__dirname+'/index.html','utf8').matchAll(/<([a-z]+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){
  const field=sandbox.document.getElementById(match[3]);field.tagName=match[1].toUpperCase();field.type=match[2].match(/\btype="([^"]+)"/)?.[1]||'';field.checked=/\bchecked\b/.test(match[2]);const value=match[2].match(/\bvalue="([^"]+)"/);if(value)field.value=value[1];
}
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/i18n.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(__dirname+'/samples.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(__dirname+'/instrument-samples.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(__dirname+'/music-core.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(__dirname+'/studio-i18n.js','utf8'),sandbox);vm.runInContext(fs.readFileSync(__dirname+'/key-composer.js','utf8'),sandbox);elements.set('comboWindow',{...el(),value:'0'});vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),sandbox);
(async()=>{
await vm.runInContext(`(async()=>{
  const event={code:'KeyZ',repeat:false,target:$('instrumentBoard'),preventDefault(){this.prevented=true;}};
  await onKeyboardDown(event);if(!event.prevented||voices.size!==1||!enabled)throw Error('first keyboard event must unlock audio');onKeyboardUp(event);panic();
})()`,sandbox);
vm.runInContext(`
const keyVoice=code=>[...voices.values()].find(v=>v.inputCode===code);
if(sampleBuffers.size!==29)throw Error('sample bank');
language='zh';translatePage();octaveOptions();render();if(document.documentElement.lang!=='zh-CN'||!$('hint').textContent.includes('连续上行'))throw Error('Chinese UI');
language='en';translatePage();render();if(document.documentElement.lang!=='en'||!$('hint').textContent.includes('Ascending'))throw Error('English UI');
if(mapping('KeyZ')!==24||mapping('KeyX')!==26||mapping('KeyC')!==28||mapping('KeyV')!==29||mapping('Equal')!==100)throw Error('main mapping');
press('KeyZ');press('KeyZ');if(voices.size!==1)throw Error('repeat');
press('KeyX');if(voices.size!==2)throw Error('chord');
press('Space');lift('KeyZ');if(![...allVoices].some(v=>v.n===24&&!v.ending))throw Error('sustain');
lift('Space');if(![...allVoices].some(v=>v.n===24&&v.ending))throw Error('pedal release');
panic();if(allVoices.size||held.size)throw Error('panic');
setMode('num');press('Numpad1');const heldVoice=keyVoice('Numpad1');if(keyVoice('Numpad1').n!==60)throw Error('do');
press('ArrowUp');if(keyVoice('Numpad1').n!==72||keyVoice('Numpad1')!==heldVoice)throw Error('up octave must reuse voice');
press('ArrowLeft');if(keyVoice('Numpad1').n!==71)throw Error('up and flat');
press('ArrowRight');if(keyVoice('Numpad1').n!==72)throw Error('opposed semitones');
lift('ArrowLeft');if(keyVoice('Numpad1').n!==73)throw Error('right sharp');
press('ArrowDown');if(keyVoice('Numpad1').n!==61)throw Error('opposed octaves');
lift('ArrowUp');if(keyVoice('Numpad1').n!==49)throw Error('down octave sharp');
lift('ArrowRight');if(keyVoice('Numpad1').n!==48)throw Error('down octave');
lift('ArrowDown');if(keyVoice('Numpad1').n!==60)throw Error('restore');
press('AltLeft');press('ControlLeft');if(keyVoice('Numpad1').n!==60||!pedal.soft||!pedal.quiet)throw Error('pedals');
lift('AltLeft');lift('ControlLeft');lift('Numpad1');if(voices.size)throw Error('release');
panic();setMode('num');
for(let d=1;d<=7;d++)if(mapping('Digit'+d)!==mapping('Numpad'+d))throw Error('dual number mapping');
if(mapping('Digit8')!==null||mapping('Numpad8')!==null)throw Error('unsupported digit');
press('Digit1');press('Numpad3');if(voices.size!==2)throw Error('mixed chord');
press('ArrowUp');if(keyVoice('Digit1').n!==72||keyVoice('Numpad3').n!==76)throw Error('mixed octave');
press('ArrowRight');if(keyVoice('Digit1').n!==73||keyVoice('Numpad3').n!==77)throw Error('mixed sharp');
lift('Digit1');if(!!keyVoice('Digit1')||!keyVoice('Numpad3'))throw Error('independent release');
panic();press('Digit1');press('Numpad1');lift('Digit1');if(!keyVoice('Numpad1'))throw Error('same pitch independent release');
setMode('main');press('ShiftLeft');press('ShiftRight');lift('ShiftLeft');if(pedal.soft||mapping('KeyZ')!==25)throw Error('main shift pitch');lift('ShiftRight');if(mapping('KeyZ')!==24)throw Error('main shift restore');
panic();if(pedal.soft||pedal.sustain||pedal.quiet)throw Error('reset pedals');
`,sandbox);
await vm.runInContext(`(async()=>{
  const down=(code,target=document.activeElement)=>({code,repeat:false,target,preventDefault(){this.prevented=true;}});
  $('voice').tagName='SELECT';$('voice').focus();$('voice').value='piano';await $('voice').onchange();
  if(document.activeElement!==$('instrumentBoard'))throw Error('voice selector retained keyboard focus');
  let e=down('KeyZ');await onKeyboardDown(e);if(!keyVoice('KeyZ'))throw Error('keyboard after instrument change');onKeyboardUp(e);panic();
  $('scoreText').tagName='TEXTAREA';$('scoreText').focus();e=down('KeyZ');onKeyboardDown(e);if(e.prevented||voices.size)throw Error('typing in score hijacked');
})()`,sandbox);
await pointerKey.onpointerdown({pointerId:7,preventDefault(){}});
assert.equal(sandbox.document.activeElement,elements.get('instrumentBoard'),'piano click must restore focus');
for(const fn of documentEvents.get('pointerup'))fn({pointerId:7,target:pointerKey});
await vm.runInContext(`(async()=>{
  let e={code:'KeyZ',repeat:false,target:$('instrumentBoard'),preventDefault(){}};await onKeyboardDown(e);const before=keyVoice('KeyZ');if(!before)throw Error('keyboard after piano click');
  $('volume').value='65';$('wheelVolume').checked=true;let prevented=0;
  const wheel=delta=>({deltaY:delta,deltaX:0,deltaMode:0,cancelable:true,target:$('instrumentBoard'),preventDefault(){prevented++;}});
  onVolumeWheel(wheel(-100));if($('volume').value!=='70'||keyVoice('KeyZ')!==before)throw Error('wheel volume or source reuse');
  onVolumeWheel(wheel(200));if($('volume').value!=='60')throw Error('wheel down');
  const skip=wheel(-100);skip.ctrlKey=true;onVolumeWheel(skip);if($('volume').value!=='60'||prevented!==2)throw Error('wheel zoom intercepted');
  $('wheelVolume').checked=false;onVolumeWheel(wheel(-100));if($('volume').value!=='60'||prevented!==2)throw Error('disabled wheel intercepted');
  $('wheelVolume').checked=true;$('volume').value='99';onVolumeWheel(wheel(-200));if($('volume').value!=='100')throw Error('wheel upper bound');
  $('volume').value='1';onVolumeWheel(wheel(200));if($('volume').value!=='0'||!$('inputStatus').textContent.includes('0%'))throw Error('wheel mute indicator');
  $('volume').value='65';volume();onKeyboardUp(e);panic();
  ctx.state='suspended';await onKeyboardDown(e);if(ctx.state!=='running'||!keyVoice('KeyZ'))throw Error('audio resume');onKeyboardUp(e);panic();
  ctx.state='suspended';const resume=ctx.resume;let finish;ctx.resume=()=>new Promise(resolve=>{finish=()=>{ctx.state='running';resolve();};});
  const pending=onKeyboardDown(e);onKeyboardUp(e);finish();await pending;if(voices.size)throw Error('released key started after load');ctx.resume=resume;panic();
})()`,sandbox);
await vm.runInContext(`(async()=>{for(const inst of ['violin','cello','flute','piano']){$('voice').value=inst;await $('voice').onchange();play('voiceTest',60);if(!voices.has('voiceTest'))throw Error('instrument '+inst);release('voiceTest');panic();} })()`,sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/teaching.js','utf8'),sandbox);
await vm.runInContext(`(async()=>{$('lessonMode').value='wait';window.lesson.load(MusicCore.parseText('1 2',60));await $('lessonStart').onclick();if(window.lesson.expected[0]!==60)throw Error('lesson start');play('wrong',61);if(window.lesson.expected[0]!==60)throw Error('wrong note advances');release('wrong');play('correct',60);if(window.lesson.expected[0]!==62)throw Error('correct note fails to advance');release('correct');play('final',62);if(window.lesson.expected.length)throw Error('lesson completion');panic();})()`,sandbox);
await vm.runInContext(`(async()=>{performance.now=()=>0;window.lesson.load({bpm:120,events:[{beat:0,duration:.5,notes:[60]},{beat:1,duration:1,notes:[62]}]});$('lessonMode').value='tempo';await $('lessonStart').onclick();performance.now=()=>400;timerCallbacks.at(-1)();if(window.lesson.expected.length)throw Error('tempo gap');performance.now=()=>600;timerCallbacks.at(-1)();if(window.lesson.expected[0]!==62)throw Error('tempo advancement');performance.now=()=>1100;timerCallbacks.at(-1)();if(window.lesson.expected.length)throw Error('tempo completion');performance.now=()=>0;window.lesson.load({bpm:120,events:[{beat:0,duration:1,notes:[60]}]});await $('lessonListen').onclick();if(!voices.has('lesson:0'))throw Error('listen preview');window.lesson.pause();if(voices.has('lesson:0'))throw Error('preview cleanup');})()`,sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/transcription.js','utf8'),sandbox);
await vm.runInContext(`(async()=>{await $('audioFile').onchange({target:{files:[{size:1000,arrayBuffer:async()=>new ArrayBuffer(1)}],value:'audio'}});if(!$('transcriptNotes').textContent.includes('A4'))throw Error('file transcription');if($('useTranscript').disabled)throw Error('transcription not ready');$('useTranscript').onclick();if(!$('scoreMessage').textContent.includes('Transcription loaded'))throw Error('transcription to lesson');await $('microphone').onclick();if(!$('transcriptStatus').textContent.includes('Microphone unavailable'))throw Error('microphone error state');})()`,sandbox);
await vm.runInContext(`(async()=>{navigator.mediaDevices={getUserMedia:async()=>({getTracks:()=>[{stop(){tracksStopped++;}}]})};await $('microphone').onclick();if(!window.transcriber.active)throw Error('microphone did not start');$('cancelTranscription').onclick();if(window.transcriber.active||tracksStopped!==1)throw Error('microphone not released');await $('liveAudio').onclick();if(!window.transcriber.active)throw Error('live file did not start');$('cancelTranscription').onclick();if(window.transcriber.active)throw Error('live file did not stop');})()`,sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/song-library.js','utf8'),sandbox);
vm.runInContext(`$('songSearch').value='';$('songGenre').value='all';$('songDifficulty').value='all';`,sandbox);
vm.runInContext(fs.readFileSync(__dirname+'/library.js','utf8'),sandbox);
vm.runInContext(`
if(window.songLibrary.count!==150||$('songGrid').children.length!==12)throw Error('song library initial view');
$('songGrid').children[0].children.at(-1).children[0].click();if(mode!=='main'||!$('lessonKeys').textContent)throw Error('library game prompt');
$('songGenre').value='pop';$('songGenre').onchange();if($('songGrid').children.length!==4)throw Error('pop import slots');
$('songGrid').children[0].children.at(-1).children[0].click();window.songLibrary.attachImport(MusicCore.parseText('1 2 3 4',60));if(!$('libraryMessage').textContent.includes('Personal score saved'))throw Error('personal import');
base=36;if(mainKeyForNote(60).text!=='G'||mainKeyForNote(61).text!=='Shift + G'||mainKeyForNote(65).shift)throw Error('letter guidance');
setMode('main');press('AltLeft');press('AltRight');lift('AltLeft');if(!pedal.soft)throw Error('two Alts');lift('AltRight');if(pedal.soft)throw Error('Alt release');panic();
`,sandbox);
// Validate every visible translation key, static DOM hook, and embedded MP3 signature.
const html=fs.readFileSync(__dirname+'/index.html','utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
for(const file of ['app.js','teaching.js','transcription.js','library.js'])for(const match of fs.readFileSync(__dirname+'/'+file,'utf8').matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Missing element '+match[1]);
for(const [,key] of html.matchAll(/data-i18n="([^"]+)"/g))assert.ok(vm.runInContext(`!!translations.en[${JSON.stringify(key)}]&&!!translations.zh[${JSON.stringify(key)}]`,sandbox),'Missing translation '+key);
const banks=vm.runInContext('[window.PIANO_SAMPLES,...Object.values(window.INSTRUMENT_SAMPLES)]',sandbox);
for(const bank of banks)for(const encoded of Object.values(bank)){const data=Buffer.from(encoded,'base64');assert.ok(data.length>500);assert.ok(data.subarray(0,3).toString()==='ID3'||(data[0]===255&&(data[1]&224)===224),'Invalid MP3 header');}
console.log('PASS: keyboard event startup/resume/focus, wheel volume, keyboard/pedals, bilingual UI hooks, 4 instrument banks, practice progression, audio import, live controls, microphone cleanup, sample integrity');})();
