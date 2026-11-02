const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scope={};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/music-core.js','utf8'),scope);
const {parseText,parseMidi,detectPitch,normalizeScore,NoteTracker}=scope.MusicCore;
const plain=x=>JSON.parse(JSON.stringify(x));
assert.deepStrictEqual(plain(parseText("1 #4 5':2 0 C5:0.5").events.map(e=>e.notes)),[[60],[66],[79],[],[72]]);
assert.equal(parseText('1:2 2:0.5 3').events[2].beat,2.5);
assert.throws(()=>parseText('1 garbage 2'));
assert.throws(()=>normalizeScore({events:[{beat:0,duration:0,notes:[60]}]}));
assert.deepStrictEqual(plain(normalizeScore({events:[{beat:0,duration:1,notes:[60]},{beat:0,duration:2,notes:[64]}]}).events),[{beat:0,duration:2,notes:[60,64]}]);
// MIDI format 0: a C-major chord at 120 BPM, 480 ticks per quarter note.
const track=[0,255,81,3,7,161,32,0,144,60,100,0,144,64,100,0,144,67,100,131,96,128,60,0,0,128,64,0,0,128,67,0,0,255,47,0];
const bytes=Buffer.from([...Buffer.from('MThd'),0,0,0,6,0,0,0,1,1,224,...Buffer.from('MTrk'),0,0,0,track.length,...track]);
const midi=parseMidi(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
assert.equal(midi.bpm,120);assert.equal(midi.events[0].duration,1);assert.deepStrictEqual(plain(midi.events[0].notes),[60,64,67]);
assert.throws(()=>parseMidi(new ArrayBuffer(0)));
// Generated signals test the recognizer's frequency accuracy, low register, harmonics, and silence.
for(const rate of [44100,48000])for(const n of [36,45,57,60,69,81]){
  const f=440*2**((n-69)/12),x=Float32Array.from({length:8192},(_,i)=>.25*Math.sin(2*Math.PI*f*i/rate)+.12*Math.sin(4*Math.PI*f*i/rate));
  const detected=detectPitch(x,rate);assert.ok(detected,`No detection for ${n}`);assert.equal(detected.midi,n,`Wrong pitch for ${n} at ${rate}`);
}
assert.equal(detectPitch(new Float32Array(8192),44100),null);
const tracker=new NoteTracker();tracker.push(60,0);tracker.push(60,.05);tracker.push(62,.5);tracker.push(62,.55);tracker.push(null,1);tracker.push(null,1.05);
assert.deepStrictEqual(plain(tracker.notes.map(n=>[n.midi,n.start,n.end])),[[60,0,.5],[62,.5,1]]);
const score=tracker.score(1.1);assert.equal(score.events[1].beat,1);assert.equal(score.events[1].duration,1);
console.log('PASS: score parsing, MIDI chords, timing, pitch detection at 44.1/48 kHz, segmentation and score conversion');
