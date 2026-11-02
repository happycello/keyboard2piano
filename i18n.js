'use strict';
const translations = {
  en: {
    eyebrow: 'A LITTLE SPACE FOR MUSIC', headline: 'Take a seat. Play a little.',
    subtitle: 'The keyboard you know. The sound of real instruments.',
    mainMode: 'White keys + Shift', numMode: 'Numbered notes', start: 'Enable sound',
    started: 'Sound enabled', loading: 'Preparing piano…',
    range: 'Starting note', volume: 'Volume', brightness: 'Brightness', stop: 'All notes off · Esc',
    sound: 'SAMPLED GRAND PIANO', mapping: 'YOUR KEYBOARD', mappingDetail: 'Hold to play · Release to damp',
    quiet: 'Quiet', quietDetail: 'Lower volume', soft: 'Soft', softDetail: 'Gentler tone',
    sustain: 'Sustain', sustainDetail: 'Let the notes ring',
    initial: 'Press a note key or enable sound. The first load prepares the instrument samples.',
    ready: 'Ready · Your piano is listening.', error: 'Could not load instrument audio. Please reopen the complete folder in a current browser and try again.',
    tipsTitle: 'A note before you play',
    tips: 'Play chords with multiple keys. Audio stops when you leave the window. An English keyboard input method is recommended.',
    limits: 'Hold Alt for Soft. Shift raises pitch in full-keyboard mode. Pedals are simulated. Computer keyboards do not sense touch velocity; simultaneous-key limits depend on your hardware.',
    credits: 'Piano samples & credits ↗', middleC: 'Middle C',
    mainHint: 'Ascending natural notes: Z row → A row → Q row → number row. Hold Shift for +1 semitone. Range {lo}–{hi} including sharps. Punctuation uses physical keys. Combo tolerance adds a short, adjustable input delay.',
    numHint: 'Both number row and numpad: 1–7 = do re mi fa sol la si. Hold ↑ / ↓ for ±1 octave; ← / → for −/+1 semitone. Combine them; release to restore. Opposing arrows cancel. Enable Num Lock for the numpad.',
    ArrowUp: 'Octave +1', ArrowDown: 'Octave −1', ArrowLeft: 'Semitone −1', ArrowRight: 'Semitone +1',
    numberRow: 'NUMBER ROW', numpad: 'NUMPAD', arrows: 'PITCH CONTROL', instrument: 'Keyboard instrument', languageLabel: 'Switch to Chinese'
  },
  zh: {
    eyebrow: '给音乐，留一点时间', headline: '落座，弹一会儿。',
    subtitle: '熟悉的电脑键盘，真实乐器的声音。',
    mainMode: '主键盘 · 白键 + Shift', numMode: '数字键盘 · 简谱', start: '开启声音',
    started: '声音已开启', loading: '正在准备钢琴音色…',
    range: '起始音', volume: '音量', brightness: '明亮度', stop: '全部止音 · Esc',
    sound: '三角钢琴 · 真实录音采样', mapping: '键盘映射', mappingDetail: '按下发声 · 松开止音',
    quiet: '弱音', quietDetail: '减小音量', soft: '柔音', softDetail: '柔化音色',
    sustain: '延音', sustainDetail: '让余音继续流淌',
    initial: '按下发音键或点击「开启声音」；首次使用需准备乐器采样。',
    ready: '准备就绪 · 让音乐从指间开始。', error: '乐器音色加载失败，请用新版浏览器重新打开完整项目文件夹后重试。',
    tipsTitle: '演奏之前', tips: '支持多键和弦，切换窗口会自动止音。建议使用英文输入法。',
    limits: 'Alt 控制柔音，主键盘模式下 Shift 用于升半音。踏板为模拟效果；普通键盘不支持力度感应，同时按键数量取决于键盘硬件。',
    credits: '钢琴采样与致谢 ↗', middleC: '中央 C',
    mainHint: '从 Z 开始，按 Z 行 → A 行 → Q 行 → 数字行连续上行自然音；按住 Shift 升半音。含升音音域 {lo}–{hi}。标点按物理键位识别。组合容错会引入一小段可调延迟。',
    numHint: '上方数字行与右侧小键盘均可使用：1–7 = do re mi fa sol la si。按住 ↑ 升八度、↓ 降八度；← 降半音、→ 升半音。可组合，松开恢复，反向同时按住则抵消。使用小键盘时请开启 Num Lock。',
    ArrowUp: '升八度', ArrowDown: '降八度', ArrowLeft: '降半音', ArrowRight: '升半音',
    numberRow: '上方数字行', numpad: '右侧小键盘', arrows: '音高控制', instrument: '键盘乐器', languageLabel: 'Switch to English'
  }
};
let language = 'en';
try { const saved = localStorage.getItem('keyboard2piano.language'); if (saved === 'zh' || saved === 'en') language = saved; } catch {}
function tr(key, values = {}) {
  let value = translations[language][key] || key;
  for (const [name, text] of Object.entries(values)) value = value.replaceAll('{' + name + '}', text);
  return value;
}
function translatePage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.getElementById('language').textContent = language === 'en' ? '中文' : 'English';
  document.getElementById('language').setAttribute('aria-label', tr('languageLabel'));
  const labels = {octave:'range',volume:'volume',brightness:'brightness',voice:'voice',lessonTempo:'tempoLabel',lessonSeek:'scorePosition',transcriptionProgress:'transcriptionProgress',comboWindow:'comboWindow',wheelVolume:'wheelVolume'};
  for (const [id, key] of Object.entries(labels)) document.getElementById(id).setAttribute('aria-label', tr(key));
  document.querySelector('.instrument')?.setAttribute('aria-label', tr('instrument'));
}
