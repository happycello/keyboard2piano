'use strict';
(function(){
  let tracker=new MusicCore.NoteTracker(),busy=false,cancel=false,stream=null,micContext=null,micSource=null,micTimer=null,liveTime=0,startTime=0,lastRender=0,job=0,fileBuffer=null,playing=false;
  const MAX_SECONDS=300;
  function result(time){
    liveTime=time;const notes=tracker.snapshot(time);
    $('transcriptNotes').textContent=notes.slice(-120).map(n=>`${noteName(n.midi)} (${n.start.toFixed(2)}–${n.end.toFixed(2)}s)`).join('  ·  ')||tr('noNotes');
    $('useTranscript').disabled=!notes.length||busy;$('exportTranscript').disabled=!notes.length||busy;
    $('transcriptCount').textContent=tr('detectedCount',{count:notes.length});
  }
  function controls(){
    $('audioFile').disabled=busy;$('microphone').disabled=busy;
    $('cancelTranscription').disabled=!busy;$('liveAudio').disabled=busy||!fileBuffer;updateInputStatus();
  }
  function stop(){
    cancel=true;job++;clearInterval(micTimer);micTimer=null;
    if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;
    if(micSource){micSource.onended=null;try{micSource.stop?.();}catch{}micSource.disconnect();micSource=null;}playing=false;
    if(micContext){micContext.close().catch(()=>{});micContext=null;}
    if(busy){tracker.close(liveTime);busy=false;$('transcriptStatus').textContent=tr('transcriptionStopped');controls();result(liveTime);}
  }
  async function decodeFile(file){
    if(busy)return;stop();const token=++job;busy=true;cancel=false;tracker=new MusicCore.NoteTracker();liveTime=0;controls();result(0);
    $('transcriptionProgress').value=0;$('transcriptStatus').textContent=tr('decoding');
    let decoder;
    try{
      if(file.size>50*1024*1024)throw Error('audioLimit');
      decoder=new (window.AudioContext||window.webkitAudioContext)();
      fileBuffer=null;const buffer=await decoder.decodeAudioData(await file.arrayBuffer());
      if(token!==job)return;
      if(buffer.duration>MAX_SECONDS)throw Error('audioLimit');fileBuffer=buffer;
      const rate=buffer.sampleRate,frames=Math.ceil(buffer.duration/.05),size=Math.min(8192,Math.pow(2,Math.ceil(Math.log2(rate*.17))));
      const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
      for(let frame=0;frame<frames;frame++){
        if(cancel||token!==job)return;
        const time=frame*.05,offset=Math.floor(time*rate),samples=new Float32Array(size);
        // Use the channel with most energy to avoid cancelling phase-shifted stereo recordings.
        let channel=channels[0],best=-1;
        for(const ch of channels){let energy=0;for(let i=offset;i<Math.min(ch.length,offset+size);i+=8)energy+=ch[i]*ch[i];if(energy>best){best=energy;channel=ch;}}
        samples.set(channel.subarray(offset,offset+size));
        const pitch=MusicCore.detectPitch(samples,rate);tracker.push(pitch?pitch.midi:null,time);liveTime=time;
        if(frame%8===0){$('pitchReadout').textContent=pitch?noteName(pitch.midi):'—';$('transcriptionProgress').value=frame/frames*100;$('transcriptStatus').textContent=tr('analysing',{percent:Math.round(frame/frames*100)});result(time);await new Promise(resolve=>setTimeout(resolve,0));}
      }
      tracker.close(buffer.duration);liveTime=buffer.duration;$('transcriptionProgress').value=100;$('transcriptStatus').textContent=tr('transcriptionDone');
    }catch(error){if(token===job)$('transcriptStatus').textContent=tr(error.message==='audioLimit'?'audioLimit':'audioError');}
    finally{if(decoder)await decoder.close();if(token===job){busy=false;controls();result(liveTime);}}
  }
  async function microphone(){
    if(busy)return;stop();const token=++job;cancel=false;busy=true;tracker=new MusicCore.NoteTracker();liveTime=0;controls();result(0);
    $('transcriptStatus').textContent=tr('micPermission');$('transcriptionProgress').value=0;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw Error();
      const incoming=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      if(token!==job){incoming.getTracks().forEach(t=>t.stop());return;}
      stream=incoming;window.lesson?.pause();panic();
      micContext=new (window.AudioContext||window.webkitAudioContext)();await micContext.resume();
      if(token!==job)return;
      const analyser=micContext.createAnalyser();analyser.fftSize=8192;
      micSource=micContext.createMediaStreamSource(stream);micSource.connect(analyser);
      const samples=new Float32Array(analyser.fftSize);startTime=performance.now();lastRender=0;
      $('transcriptStatus').textContent=tr('micListening');
      micTimer=setInterval(()=>{
        if(!stream)return;const time=(performance.now()-startTime)/1000;liveTime=time;
        if(time>=MAX_SECONDS){stop();return;}
        analyser.getFloatTimeDomainData(samples);const pitch=MusicCore.detectPitch(samples,micContext.sampleRate);
        tracker.push(pitch?pitch.midi:null,time);$('pitchReadout').textContent=pitch?noteName(pitch.midi):'—';
        $('transcriptionProgress').value=time/MAX_SECONDS*100;
        if(time-lastRender>.25){result(time);lastRender=time;}
      },50);
    }catch{if(token===job){stop();$('transcriptStatus').textContent=tr('micError');}}
  }
  async function liveFile(){
    if(busy||!fileBuffer)return;stop();const token=++job;busy=true;cancel=false;tracker=new MusicCore.NoteTracker();liveTime=0;controls();result(0);
    try{
      window.lesson?.pause();panic();micContext=new (window.AudioContext||window.webkitAudioContext)();await micContext.resume();if(token!==job)return;
      const analyser=micContext.createAnalyser();analyser.fftSize=8192;
      micSource=micContext.createBufferSource();micSource.buffer=fileBuffer;micSource.connect(analyser);analyser.connect(micContext.destination);
      playing=true;const samples=new Float32Array(analyser.fftSize),begin=micContext.currentTime;
      micSource.onended=()=>{liveTime=fileBuffer.duration;stop();$('transcriptionProgress').value=100;$('transcriptStatus').textContent=tr('transcriptionDone');};
      micSource.start();$('transcriptStatus').textContent=tr('liveFileStatus');updateInputStatus();
      micTimer=setInterval(()=>{if(!playing)return;const time=micContext.currentTime-begin;liveTime=time;analyser.getFloatTimeDomainData(samples);const pitch=MusicCore.detectPitch(samples,micContext.sampleRate);tracker.push(pitch?pitch.midi:null,time);$('pitchReadout').textContent=pitch?noteName(pitch.midi):'—';$('transcriptionProgress').value=time/fileBuffer.duration*100;result(time);},50);
    }catch{if(token===job){stop();$('transcriptStatus').textContent=tr('audioError');}}
  }
  $('liveAudio').onclick=liveFile;
  $('audioFile').onchange=async e=>{const file=e.target.files[0];if(file)await decodeFile(file);e.target.value='';};
  $('microphone').onclick=microphone;$('cancelTranscription').onclick=stop;
  $('useTranscript').onclick=()=>{try{const score=tracker.score(liveTime);score.title=tr('transcribedScore');window.lesson.load(score);$('scoreMessage').textContent=tr('reviewTranscript');}catch{$('transcriptStatus').textContent=tr('noNotes');}};
  $('exportTranscript').onclick=()=>{try{const score=tracker.score(liveTime);score.title='Transcribed melody';const url=URL.createObjectURL(new Blob([JSON.stringify(score,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='keyboard2piano-transcription.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{}};
  window.addEventListener('blur',()=>{if(stream||playing)stop();});window.addEventListener('pagehide',stop);
  window.transcriber={stop,localize(){result(liveTime);$('transcriptStatus').textContent=tr(busy?(stream?'micListening':playing?'liveFileStatus':'decoding'):'transcriptionIdle');},get active(){return !!stream||playing;}};
  controls();result(0);$('transcriptStatus').textContent=tr('transcriptionIdle');
})();
