const fs=require('fs'),vm=require('vm'),assert=require('assert');
const scope={window:{}};vm.createContext(scope);
vm.runInContext(fs.readFileSync(__dirname+'/music-core.js','utf8'),scope);
vm.runInContext(fs.readFileSync(__dirname+'/song-library.js','utf8'),scope);
const songs=scope.window.SONG_LIBRARY;
assert.equal(songs.length,150);assert.equal(new Set(songs.map(s=>s.id)).size,150);
const levels=new Set(),genres=new Set();assert.equal(new Set(songs.map(s=>(s.title+'|'+s.composer).toLowerCase())).size,150);
for(const song of songs){
  assert.equal(song.license,'Public Domain');assert.ok(song.source.startsWith('https://www.mutopiaproject.org/'));
  assert.ok(song.midiUrl.startsWith('https://www.mutopiaproject.org/'));
  assert.ok(song.title&&song.composer&&song.sourceDetails.includes('Public Domain'));
  const score=scope.MusicCore.normalizeScore(song.score);assert.ok(score.events.length>=8);
  assert.ok(score.events.every(e=>e.notes.length===1),'Library reduction must be single-line');
  const pitches=score.events.flatMap(e=>e.notes),base=Math.max(12,Math.min(36,Math.floor(Math.min(...pitches)/12)*12));
  assert.ok(Math.min(...pitches)>=base&&Math.max(...pitches)<=base+77,'Automatic keyboard fit: '+song.title);
  genres.add(song.genre);levels.add(song.difficulty);
}
assert.equal(genres.size,3);assert.equal(levels.size,3);
console.log('PASS: 150 unique playable public-domain songs, source metadata, single-line reductions, keyboard range and category/level coverage');
