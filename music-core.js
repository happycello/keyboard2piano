'use strict';
// Pure score and pitch utilities shared by the teaching and transcription views.
(function (root) {
  const scale = [0,2,4,5,7,9,11], letters = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  function normalizeScore(score) {
    if (!score || !Array.isArray(score.events) || !score.events.length || score.events.length > 20000) throw Error('invalidScore');
    const events = score.events.map(e => {
      const beat = Number(e.beat), duration = Number(e.duration);
      if (!Number.isFinite(beat) || beat < 0 || !Number.isFinite(duration) || duration <= 0 || !Array.isArray(e.notes)) throw Error('invalidScore');
      const notes = [...new Set(e.notes.map(Number))];
      if (notes.some(n => !Number.isInteger(n) || n < 21 || n > 108)) throw Error('invalidScore');
      return {beat, duration, notes};
    }).sort((a,b) => a.beat-b.beat);
    // Merge simultaneous starts into a single practice chord.
    const merged = [];
    for (const e of events) {
      const last = merged.at(-1);
      if (last && Math.abs(last.beat-e.beat)<.0001) {
        last.notes = [...new Set([...last.notes,...e.notes])]; last.duration = Math.max(last.duration,e.duration);
      } else merged.push(e);
    }
    return {title:String(score.title || 'Imported score').slice(0,160), bpm:Math.max(30,Math.min(240,Number(score.bpm)||100)), events:merged};
  }
  function parseText(text, base = 60) {
    // 1..7 / C4..B5, # or b, octave marks ' or ,; :duration in quarter-note beats; 0/R = rest.
    let beat=0;
    const tokens=text.trim().split(/[\s|]+/).filter(Boolean);
    if (!tokens.length) throw Error('invalidScore');
    const events=tokens.map(token => {
      const m=token.match(/^([#b]?[1-7][',]*|[A-G][#b]?[0-8]|0|R)(?::(\d+(?:\.\d+)?))?$/i);
      if(!m) throw Error('invalidScore');
      const value=m[1],duration=m[2]?Number(m[2]):1;let notes=[];
      if(!/^(0|R)$/i.test(value)) {
        const digit=value.match(/^([#b]?)([1-7])([',]*)$/);
        if(digit) notes=[base+scale[+digit[2]-1]+(digit[1]==='#'?1:digit[1]==='b'?-1:0)+12*([...digit[3]].filter(c=>c==="'").length-[...digit[3]].filter(c=>c===',').length)];
        else {const n=value.match(/^([A-G])([#b]?)([0-8])$/i);notes=[12*(+n[3]+1)+letters[n[1].toUpperCase()]+(n[2]==='#'?1:n[2]==='b'?-1:0)];}
      }
      const event={beat,duration,notes};beat+=duration;return event;
    });
    return normalizeScore({events});
  }
  function parseMidi(arrayBuffer, options = {}) {
    const d=new DataView(arrayBuffer);let p=0;
    const str=n=>{let s='';while(n--)s+=String.fromCharCode(d.getUint8(p++));return s;};
    const u16=()=>{const v=d.getUint16(p);p+=2;return v;};
    const u32=()=>{const v=d.getUint32(p);p+=4;return v;};
    const vlq=()=>{let v=0,b,count=0;do{if(++count>4)throw Error('invalidScore');b=d.getUint8(p++);v=(v<<7)|(b&127);}while(b&128);return v;};
    if(str(4)!=='MThd')throw Error('invalidScore');const len=u32(),headerEnd=p+len,format=u16(),tracks=u16(),division=u16();
    if(format>1||division&0x8000||!division||len<6)throw Error('invalidScore');p=headerEnd;
    let bpm=100,tempoFound=false;const events=[];
    for(let t=0;t<tracks;t++){
      if(str(4)!=='MTrk')throw Error('invalidScore');const end=u32()+p;let tick=0,running=0;const active=new Map();
      while(p<end){tick+=vlq();let status=d.getUint8(p++);if(status<128){p--;status=running;}else if(status<240)running=status;
        if(status===255){const type=d.getUint8(p++),size=vlq();if(type===81&&size===3&&!tempoFound){bpm=60000000/((d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2));tempoFound=true;}p+=size;continue;}
        if(status===240||status===247){const size=vlq();p+=size;continue;}
        if(status<128||status>=240)throw Error('invalidScore');
        const kind=status>>4,channel=status&15,a=d.getUint8(p++),b=(kind===12||kind===13)?0:d.getUint8(p++),key=channel+':'+a;
        if(channel===9)continue;
        if(kind===9&&b>0){if(active.has(key))finish(key,tick);active.set(key,{tick,n:a});}
        else if(kind===8||(kind===9&&b===0))finish(key,tick);
      }
      for(const key of active.keys())finish(key,tick);
      function finish(key,endTick){const start=active.get(key);if(!start)return;active.delete(key);if(start.n>=21&&start.n<=108&&endTick>start.tick)events.push({beat:start.tick/division,duration:(endTick-start.tick)/division,notes:[start.n],track:t});}
      p=end;
    }
    if(options.melody){
      const tracks=new Map();for(const event of events){if(!tracks.has(event.track))tracks.set(event.track,[]);tracks.get(event.track).push(event);}
      const largest=Math.max(0,...[...tracks.values()].map(e=>e.length));
      const leads=[...tracks.values()].filter(e=>e.length>=Math.min(16,largest)&&e.length>=largest*.12);
      leads.sort((a,b)=>b.map(e=>e.notes[0]).sort((x,y)=>x-y)[Math.floor(b.length/2)]-a.map(e=>e.notes[0]).sort((x,y)=>x-y)[Math.floor(a.length/2)]);
      const reduced=normalizeScore({events:leads[0]||events,bpm});const first=reduced.events[0].beat;
      reduced.events=reduced.events.filter(e=>e.notes.length).map(e=>({...e,beat:e.beat-first,notes:[Math.max(...e.notes)]}));
      return reduced;
    }
    return normalizeScore({events,bpm});
  }
  function detectPitch(input, sampleRate) {
    // Downsample to roughly 11 kHz before an original YIN-style difference calculation.
    const step=Math.max(1,Math.floor(sampleRate/11025)),rate=sampleRate/step;
    const length=Math.min(2048,Math.floor(input.length/step));if(length<512)return null;
    const x=new Float32Array(length);let mean=0,energy=0;
    for(let i=0;i<length;i++){let value=0;for(let k=0;k<step;k++)value+=input[i*step+k];x[i]=value/step;mean+=x[i];}
    mean/=length;for(let i=0;i<length;i++){x[i]-=mean;energy+=x[i]*x[i];}
    if(Math.sqrt(energy/length)<.008)return null;
    const max=Math.min(Math.floor(rate/55),Math.floor(length/2)-1),min=Math.max(2,Math.floor(rate/1500)),size=length-max;
    const diff=new Float64Array(max+1);let sum=0;diff[0]=1;
    for(let lag=1;lag<=max;lag++){let s=0;for(let i=0;i<size;i++){const delta=x[i]-x[i+lag];s+=delta*delta;}sum+=s;diff[lag]=sum?s*lag/sum:1;}
    let tau=-1;
    for(let lag=min;lag<max;lag++)if(diff[lag]<.15){while(lag+1<max&&diff[lag+1]<diff[lag])lag++;tau=lag;break;}
    if(tau<0)return null;
    const left=diff[tau-1],center=diff[tau],right=diff[tau+1],den=left-2*center+right;
    const refined=tau+(den?(left-right)/(2*den):0),frequency=rate/refined,midi=Math.round(69+12*Math.log2(frequency/440));
    if(midi<33||midi>90)return null;
    return {midi,frequency,confidence:1-center};
  }
  class NoteTracker {
    constructor(){this.notes=[];this.current=null;this.candidate=null;this.count=0;this.candidateStart=0;}
    push(midi,time){
      if(midi!==this.candidate){this.candidate=midi;this.count=1;this.candidateStart=time;}else this.count++;
      if(this.count>=2&&this.current?.midi!==midi){this.close(this.candidateStart);if(midi!==null)this.current={midi,start:Math.max(0,this.candidateStart)};}
    }
    close(time){if(this.current){if(time-this.current.start>=.09)this.notes.push({...this.current,end:time});this.current=null;}}
    snapshot(time){return [...this.notes,...(this.current&&time-this.current.start>=.09?[{...this.current,end:time}]:[])];}
    score(time){return normalizeScore({bpm:120,events:this.snapshot(time).map(n=>({beat:n.start*2,duration:Math.max(.18,(n.end-n.start)*2),notes:[n.midi]}))});}
  }
  root.MusicCore={normalizeScore,parseText,parseMidi,detectPitch,NoteTracker};
})(globalThis);
