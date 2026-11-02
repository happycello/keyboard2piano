'use strict';
(function(){
  const wishes=[
    {id:'sky',title:'天空之城 · 配乐 / Castle in the Sky',genre:'anime'},
    {id:'totoro',title:'龙猫 · 配乐 / My Neighbor Totoro',genre:'anime'},
    {id:'spirited',title:'千与千寻 · 配乐 / Spirited Away',genre:'anime'},
    {id:'kiki',title:"魔女宅急便 · 配乐 / Kiki’s Delivery Service",genre:'anime'},
    {id:'sunny',title:'晴天 / Sunny Day',genre:'pop'},
    {id:'jasmine',title:'七里香 / Common Jasmine Orange',genre:'pop'},
    {id:'flowers',title:'花海 / Sea of Flowers',genre:'pop'},
    {id:'rice',title:'稻香 / Rice Field',genre:'pop'}
  ];
  let page=0,pending=null;const PAGE_SIZE=12,saved={};
  for(const wish of wishes){try{const text=localStorage.getItem('keyboard2piano.song.'+wish.id);if(text)saved[wish.id]=MusicCore.normalizeScore(JSON.parse(text));}catch{}}
  function estimate(score){
    const events=score.events.filter(e=>e.notes.length),length=Math.max(1,...events.map(e=>e.beat+e.duration));
    const density=events.length/length*score.bpm/60,changed=events.filter(e=>e.notes.some(n=>[1,3,6,8,10].includes(n%12))).length/Math.max(1,events.length);
    return density<2&&changed<.12?'beginner':density<4&&changed<.3?'intermediate':'advanced';
  }
  function all(){return [...(window.SONG_LIBRARY||[]),...wishes.map(w=>({...w,difficulty:saved[w.id]?estimate(saved[w.id]):'import',score:saved[w.id]||null,personal:true,composer:tr(w.genre==='anime'?'yourFilmImport':'yourPopImport')}))];}
  function filtered(){
    const query=$('songSearch').value.trim().toLocaleLowerCase(),genre=$('songGenre').value,difficulty=$('songDifficulty').value;
    return all().filter(s=>(genre==='all'||s.genre===genre)&&(difficulty==='all'||s.difficulty===difficulty)&&(!query||[s.title,s.composer,s.period||''].join(' ').toLocaleLowerCase().includes(query)));
  }
  function render(){
    const songs=filtered(),pages=Math.max(1,Math.ceil(songs.length/PAGE_SIZE));page=Math.max(0,Math.min(page,pages-1));
    $('songCount').textContent=tr('libraryCount',{count:(window.SONG_LIBRARY||[]).length,visible:songs.length});
    $('songPage').textContent=`${page+1} / ${pages}`;$('songPrev').disabled=page===0;$('songNext').disabled=page+1>=pages;
    $('songSearch').placeholder=tr('songSearch');$('songSearch').setAttribute('aria-label',tr('songSearch'));$('songGenre').setAttribute('aria-label',tr('genreAll'));$('songDifficulty').setAttribute('aria-label',tr('difficultyAll'));
    const grid=$('songGrid');grid.replaceChildren();
    if(!songs.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=tr('noSongs');grid.append(empty);return;}
    for(const song of songs.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE)){
      const card=document.createElement('article');card.className='song-card';
      const title=document.createElement('h3');title.textContent=song.title;card.append(title);
      const composer=document.createElement('p');composer.textContent=song.composer;card.append(composer);
      const tags=document.createElement('p');tags.className='song-tags';tags.textContent=tr('genre'+song.genre[0].toUpperCase()+song.genre.slice(1))+' · '+tr(song.difficulty);card.append(tags);
      const detail=document.createElement('p');detail.textContent=song.personal?tr(song.score?'privateScore':'importSlot'):tr('autoReduction');card.append(detail);
      const actions=document.createElement('div');actions.className='song-actions';
      const button=document.createElement('button');button.textContent=tr(song.score?'playSong':'importSong');button.onclick=()=>choose(song);actions.append(button);
      if(song.source){const source=document.createElement('a');source.href=song.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent=tr('songSource');actions.append(source);}
      card.append(actions);grid.append(card);
    }
  }
  function choose(song){
    if(!song.score){pending=song;$('libraryMessage').textContent=tr('choosePersonalScore',{title:song.title});$('scoreFile').click();return;}
    window.lesson.load(song.score,song.title);$('songLibraryPanel').open=false;$('gameHud').scrollIntoView({block:'center',behavior:'smooth'});returnToKeyboard();
    $('libraryMessage').textContent=song.personal?tr('privateScore'):tr('songSelected',{title:song.title});
  }
  $('songSearch').oninput=()=>{page=0;render();};$('songGenre').onchange=()=>{page=0;render();};$('songDifficulty').onchange=()=>{page=0;render();};
  $('songPrev').onclick=()=>{page--;render();};$('songNext').onclick=()=>{page++;render();};
  window.songLibrary={
    localize:render,
    attachImport(score){
      if(!pending)return;const song=pending;pending=null;const normalized=MusicCore.normalizeScore(score);normalized.title=song.title;saved[song.id]=normalized;
      let persisted=true;try{localStorage.setItem('keyboard2piano.song.'+song.id,JSON.stringify(normalized));}catch{persisted=false;}
      window.lesson.load(normalized,song.title);$('songLibraryPanel').open=false;$('gameHud').scrollIntoView({block:'center',behavior:'smooth'});$('libraryMessage').textContent=tr(persisted?'personalSaved':'personalMemoryOnly');render();
    },
    get count(){return (window.SONG_LIBRARY||[]).length;}
  };
  render();
})();
