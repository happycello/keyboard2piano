'use strict';
(function(){
  const demo=()=>MusicCore.parseText('1 1 5 5 6 6 5:2 4 4 3 3 2 2 1:2',60);
  let score=demo(),index=0,running=false,timer=null,startTime=0,startBeat=0,preview=false,lastIndex=-1,stripBase=-1,hitSteps=new Set(),wrongNotes=0;
  const expected=()=>{const e=score.events[index];if(!running||!e)return[];if((preview||$('lessonMode').value==='tempo')&&timeBeat()>=e.beat+e.duration)return[];return e.notes;};
  function timeBeat(){return startBeat+(performance.now()-startTime)/60000*Number($('lessonTempo').value);}
  function paint(){
    if(stripBase!==base){strip();return;}
    const target=new Set(expected());
    document.querySelectorAll('[data-note]').forEach(el=>el.classList.toggle('guide',target.has(+el.dataset.note)));
    document.querySelectorAll('[data-code]').forEach(el=>el.classList.toggle('guide',target.has(mapping(el.dataset.code))));
    document.querySelectorAll('[data-step]').forEach(el=>el.classList.toggle('current',running&&+el.dataset.step===index));
    const current=score.events[index];
    const prompt=target.size?[...target]:!running?current?.notes||[]:[];
    $('lessonKeys').textContent=prompt.map(n=>mainKeyForNote(n)?.text||'—').join('  +  ')||'—';
    $('lessonGameStats').textContent=tr('gameStats',{hits:hitSteps.size,errors:wrongNotes});
    $('lessonTarget').textContent=target.size?[...target].map(noteName).join(' + '):running?tr('rest'):tr('lessonReady');
    $('lessonCount').textContent=`${Math.min(index+1,score.events.length)} / ${score.events.length}`;
    $('lessonSeek').value=String(index);
    $('lessonStart').textContent=tr(running?'pauseLesson':'startLesson');$('quickLessonStart').textContent=tr(running?'pauseLesson':'startLesson');$('hudSongTitle').textContent=score.title;
    if(target.size){
      const reachable=[...target].every(n=>document.querySelector(`[data-note="${n}"]`));
      $('lessonAdvice').textContent=!reachable?tr('outsideRange'):mode==='num'?tr('numberAdvice'):tr('litAdvice');
    }else $('lessonAdvice').textContent=tr('lessonHelp');
    if(current&&running){const strip=$('lessonStrip'),card=strip.querySelector(`[data-step="${index}"]`);if(card){const left=card.offsetLeft;if(left<strip.scrollLeft||left+card.offsetWidth>strip.scrollLeft+strip.clientWidth)strip.scrollLeft=Math.max(0,left-12);}}
  }
  function strip(){
    stripBase=base;
    $('lessonTitle').textContent=score.title;
    $('lessonStrip').innerHTML=score.events.map((e,i)=>`<button data-step="${i}" aria-label="${i+1}: ${e.notes.map(noteName).join(', ')||tr('rest')}"><small>${i+1}</small><b>${e.notes.map(n=>mainKeyForNote(n)?.text||'—').join(' + ')||'𝄽'}</b><span>${e.notes.map(noteName).join('+')} · ${Number(e.duration.toFixed(2))} ♩</span></button>`).join('');
    $('lessonStrip').querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>seek(+el.dataset.step));
    $('lessonSeek').max=String(score.events.length-1);paint();
  }
  function stopPreview(){for(const [id] of voices)if(String(id).startsWith('lesson:'))release(id,true);}
  function pause(){running=false;clearInterval(timer);timer=null;stopPreview();paint();}
  function prepareKeyboard(){
    if(mode!=='main')setMode('main');
    const notes=score.events.flatMap(e=>e.notes),lowest=Math.min(...notes);
    const fit=Number.isFinite(lowest)?Math.max(12,Math.min(36,Math.floor(lowest/12)*12)):36;
    base=fit;octaveOptions();render();
  }
  function load(value,title){pause();score=MusicCore.normalizeScore(value);if(title)score.title=String(title).slice(0,160);index=0;hitSteps.clear();wrongNotes=0;$('lessonJudgement').textContent='';$('lessonTempo').value=String(Math.round(score.bpm));prepareKeyboard();strip();}

  function seek(i){index=Math.max(0,Math.min(score.events.length-1,i));startBeat=score.events[index].beat;startTime=performance.now();lastIndex=-1;stopPreview();paint();}
  function finish(){pause();index=score.events.length-1;paint();$('lessonTarget').textContent=tr('lessonComplete');}
  function next(){index++;while(index<score.events.length&&!score.events[index].notes.length)index++;if(index>=score.events.length){finish();return;}paint();}
  function tick(){
    if(!running)return;
    if(!preview&&$('lessonMode').value==='wait')return;
    const beat=timeBeat();
    while(index+1<score.events.length&&beat>=score.events[index+1].beat)index++;
    const e=score.events[index];
    if(beat>=e.beat+e.duration&&index===score.events.length-1){finish();return;}
    if(index!==lastIndex){lastIndex=index;stopPreview();if(preview)e.notes.forEach((n,j)=>play(`lesson:${j}`,n));paint();}
    if(preview&&beat>=e.beat+e.duration)stopPreview();paint();
  }
  async function start(listen=false){
    if(running){pause();return;}
    try{await audio();}catch{return;}
    prepareKeyboard();returnToKeyboard();preview=listen;running=true;lastIndex=-1;startBeat=score.events[index].beat;startTime=performance.now();
    if(!listen&&$('lessonMode').value==='wait'&&!score.events[index].notes.length)next();
    timer=setInterval(tick,25);tick();paint();
  }
  function onNote(n,id){
    if(!running||preview||String(id).startsWith('lesson:'))return;
    const target=expected();
    if(!target.includes(n)){wrongNotes++;$('lessonJudgement').textContent=tr('tryKeys',{keys:target.map(p=>mainKeyForNote(p)?.text||noteName(p)).join(' + ')});paint();return;}
    const down=new Set([...voices.values()].filter(v=>!String(v.id).startsWith('lesson:')).map(v=>v.n));
    if(target.length&&target.every(note=>down.has(note))){
      hitSteps.add(index);$('lessonJudgement').textContent=tr('goodHit');
      if($('lessonMode').value==='wait')next();else paint();
    }
  }
  function parseXml(text){
    const xml=new DOMParser().parseFromString(text,'application/xml');
    if(xml.querySelector('parsererror'))throw Error('invalidScore');
    const part=xml.querySelector('score-partwise > part');if(!part)throw Error('invalidScore');
    let divisions=1,cursor=0,lastStart=0;const events=[];
    for(const measure of part.querySelectorAll(':scope > measure')){
      let max=cursor;
      for(const item of measure.children){
        if(item.tagName==='attributes'){divisions=Number(item.querySelector('divisions')?.textContent)||divisions;continue;}
        const duration=(Number(item.querySelector('duration')?.textContent)||0)/divisions;
        if(item.tagName==='backup'){cursor-=duration;continue;}if(item.tagName==='forward'){cursor+=duration;max=Math.max(max,cursor);continue;}
        if(item.tagName!=='note'||item.querySelector('grace')||duration<=0)continue;
        const chord=!!item.querySelector('chord'),beat=chord?lastStart:cursor,pitch=item.querySelector('pitch');let notes=[];
        if(pitch){const step=pitch.querySelector('step')?.textContent,oct=Number(pitch.querySelector('octave')?.textContent),alter=Number(pitch.querySelector('alter')?.textContent)||0;notes=[12*(oct+1)+{C:0,D:2,E:4,F:5,G:7,A:9,B:11}[step]+alter];}
        const tieStop=!!item.querySelector('tie[type="stop"]');
        if(tieStop&&notes.length){const previous=[...events].reverse().find(e=>e.notes.includes(notes[0])&&Math.abs(e.beat+e.duration-beat)<.001);if(previous)previous.duration+=duration;else events.push({beat,duration,notes});}
        else events.push({beat,duration,notes});
        if(!chord){lastStart=cursor;cursor+=duration;}max=Math.max(max,beat+duration,cursor);
      }
      cursor=max;
    }
    const title=xml.querySelector('work-title, movement-title')?.textContent||'MusicXML';
    return MusicCore.normalizeScore({title,bpm:100,events});
  }
  $('lessonStart').onclick=()=>start();$('quickLessonStart').onclick=()=>start();$('lessonListen').onclick=()=>start(true);$('lessonReset').onclick=()=>{pause();hitSteps.clear();wrongNotes=0;seek(0);};
  $('lessonSeek').oninput=()=>seek(+$('lessonSeek').value);$('lessonMode').onchange=pause;
  $('lessonTempo').onchange=()=>{pause();$('lessonTempo').value=String(Math.max(30,Math.min(240,Number($('lessonTempo').value)||100)));};
  $('demoLesson').onclick=()=>load({...demo(),title:tr('demoTitle')});
  $('applyScore').onclick=()=>{try{load(MusicCore.parseText($('scoreText').value,60),tr('customScore'));$('scoreMessage').textContent=tr('scoreLoaded');}catch{$('scoreMessage').textContent=tr('scoreError');}};
  $('scoreFile').onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{if(file.size>5*1024*1024)throw Error();let parsed;
      if(/\.midi?$/i.test(file.name))parsed=MusicCore.parseMidi(await file.arrayBuffer(),{melody:$('melodyImport').checked});
      else{const text=await file.text();parsed=/\.json$/i.test(file.name)?MusicCore.normalizeScore(JSON.parse(text)):/\.(musicxml|xml)$/i.test(file.name)?parseXml(text):MusicCore.parseText(text,60);}
      if($('melodyImport').checked)parsed=MusicCore.normalizeScore({...parsed,events:parsed.events.map(e=>({...e,notes:e.notes.length?[Math.max(...e.notes)]:[]}))});
      load(parsed,file.name);window.songLibrary?.attachImport(parsed,file.name);$('scoreMessage').textContent=tr('scoreLoaded')+(/\.midi?$|\.(musicxml|xml)$/i.test(file.name)?' '+tr('importTiming'):'');
    }catch{$('scoreMessage').textContent=tr('scoreError');}finally{e.target.value='';}
  };
  window.lesson={paint,onNote,pause,load,localize(){strip();},get expected(){return expected();},get stats(){return {hits:hitSteps.size,errors:wrongNotes};}};
  load({...demo(),title:tr('demoTitle')});
})();
