const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scope={setTimeout,clearTimeout};vm.createContext(scope);vm.runInContext(fs.readFileSync(__dirname+'/key-composer.js','utf8'),scope);
// A browser's Window timers reject an arbitrary receiver. Earlier arrow-only
// mocks missed the borrowed-method bug that silenced every buffered input.
{
  const browser={windowTimerBrand:true,calls:[],setTimeout:function(fn,ms){if(!this.windowTimerBrand)throw new TypeError('Illegal invocation');this.calls.push(fn);return this.calls.length;},clearTimeout:function(){if(!this.windowTimerBrand)throw new TypeError('Illegal invocation');}};
  vm.createContext(browser);vm.runInContext(fs.readFileSync(__dirname+'/key-composer.js','utf8'),browser);
  vm.runInContext(`const c=new KeyComposer({pitch:()=>60,tolerance:()=>60,start:()=>{globalThis.started=true;},end:()=>{},retune:()=>{}});c.noteOn('KeyA');`,browser);
  browser.calls[0]();assert.equal(browser.started,true);vm.runInContext("c.noteOn('KeyB');c.cancel()",browser);
}
function fixture(delay=60){
  let now=0,next=0,up=false;const timers=new Map(),events=[];
  const clock=target=>{while(true){const task=[...timers.entries()].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!task)break;now=task[1].at;timers.delete(task[0]);task[1].fn();}now=target;};
  const input=new scope.KeyComposer({pitch:code=>60+(code==='two'?4:0)+(up?12:0),tolerance:()=>delay,
    start:s=>events.push({type:'start',at:now,id:s.id,pitch:s.pitch}),end:s=>events.push({type:'end',at:now,id:s.id}),retune:s=>events.push({type:'retune',at:now,id:s.id,pitch:s.pitch}),
    setTimer:(fn,ms)=>{const id=++next;timers.set(id,{at:now+ms,fn});return id;},clearTimer:id=>timers.delete(id)});
  return {input,events,clock,modifier(value){up=value;input.modifierChange(value);}};
}
// Number first, modifier 25 ms later: the unmodified pitch is never started.
{
  const f=fixture();f.input.noteOn('one');f.clock(25);f.modifier(true);f.clock(60);
  assert.equal(f.events.length,1);assert.equal(f.events[0].pitch,72);assert.equal(f.events[0].at,60);
}
// Modifier first and note later use the same musical pitch and keep note duration.
{
  const f=fixture();f.modifier(true);f.clock(25);f.input.noteOn('one');f.clock(85);f.clock(100);f.input.noteOff('one');f.clock(160);
  assert.deepStrictEqual(f.events.map(e=>[e.type,e.at]),[['start',85],['end',160]]);
}
// Releasing the arrow shortly before the number must not produce a low tail.
{
  const f=fixture();f.modifier(true);f.input.noteOn('one');f.clock(200);f.modifier(false);f.clock(220);f.input.noteOff('one');f.clock(300);
  assert.equal(f.events.filter(e=>e.type==='retune').length,0);assert.equal(f.events[0].pitch,72);
}
// A tap shorter than the tolerance window is retained, and fast repetitions stay independent.
{
  const f=fixture();f.input.noteOn('one');f.clock(20);f.input.noteOff('one');f.clock(40);f.input.noteOn('one');f.clock(60);f.input.noteOff('one');f.clock(120);
  assert.deepStrictEqual(f.events.map(e=>[e.type,e.at]),[['start',60],['end',80],['start',100],['end',120]]);
  assert.notEqual(f.events[0].id,f.events[2].id);
}
// Intentional pitch change on a long-held note keeps the original voice ID.
{
  const f=fixture();f.input.noteOn('one');f.clock(200);f.modifier(true);f.clock(260);
  assert.equal(f.events.filter(e=>e.type==='start').length,1);assert.equal(f.events[1].type,'retune');assert.equal(f.events[0].id,f.events[1].id);
}
// New chord notes do not restart or postpone another note's input window.
{
  const f=fixture();f.input.noteOn('one');f.clock(40);f.input.noteOn('two');f.clock(55);f.modifier(true);f.clock(100);
  assert.deepStrictEqual(f.events.filter(e=>e.type==='start').map(e=>[e.at,e.pitch]),[[60,72],[100,76]]);
}
// Escape/focus loss cancels pending attacks, even after physical release.
{
  const f=fixture();f.input.noteOn('one');f.clock(10);f.input.noteOff('one');f.input.cancel();f.clock(200);assert.equal(f.events.length,0);
}
// Zero-latency mode remains available.
{
  const f=fixture(0);f.input.noteOn('one');f.modifier(true);f.input.noteOff('one');assert.deepStrictEqual(f.events.map(e=>e.type),['start','retune','end']);
}
console.log('PASS: modifier order, release tolerance, short taps, repeated notes, legato pitch changes, chord timing, cancellation and zero-latency mode');
