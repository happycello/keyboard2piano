'use strict';
// Small input window for modifiers and note keys. Every note keeps its own clock,
// so fast passages do not keep postponing the rest of the chord.
(function(root){
  class KeyComposer {
    constructor({pitch,tolerance,start,end,retune,changed=()=>{},setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}) {
      Object.assign(this,{pitch,tolerance,start,end,retune,changed,setTimer,clearTimer});
      this.active=new Map();this.sessions=new Set();this.serial=0;this.modifierTimer=null;
    }
    delay(){return Math.max(0,Math.min(120,Number(this.tolerance())||0));}
    noteOn(code){
      if(this.active.has(code))return;
      const pitch=this.pitch(code);if(pitch===null)return;
      const s={id:'key:'+ ++this.serial,code,pitch,started:false,delay:this.delay(),timers:new Set()};
      this.active.set(code,s);this.sessions.add(s);
      this.schedule(s,()=>{s.started=true;this.start(s);},s.delay);
    }
    schedule(s,fn,delay){
      if(!delay){fn();return;}
      const timer=this.setTimer(()=>{s.timers.delete(timer);fn();},delay);s.timers.add(timer);
    }
    noteOff(code){
      const s=this.active.get(code);if(!s)return;this.active.delete(code);
      // Keep the same offset at both edges, including taps shorter than the window.
      this.schedule(s,()=>{this.end(s);this.sessions.delete(s);},s.delay);
    }
    modifierChange(down){
      if(down)for(const s of this.active.values())if(!s.started)s.pitch=this.pitch(s.code);
      if(this.modifierTimer!==null)this.clearTimer(this.modifierTimer);
      this.modifierTimer=null;
      if(!this.active.size)return;
      const apply=()=>{
        this.modifierTimer=null;
        for(const s of this.active.values()){
          const pitch=this.pitch(s.code);if(pitch===null||pitch===s.pitch)continue;
          s.pitch=pitch;if(s.started)this.retune(s);
        }
        this.changed();
      };
      const delay=this.delay();if(delay)this.modifierTimer=this.setTimer(apply,delay);else apply();
    }
    cancel(){
      if(this.modifierTimer!==null)this.clearTimer(this.modifierTimer);this.modifierTimer=null;
      for(const s of this.sessions)for(const timer of s.timers)this.clearTimer(timer);
      this.active.clear();this.sessions.clear();
    }
  }
  root.KeyComposer=KeyComposer;
})(globalThis);
