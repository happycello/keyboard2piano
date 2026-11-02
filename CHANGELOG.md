# Changelog / 更新日志

[English](#english) · [简体中文](#简体中文)

## English

This log records local development changes. The history below was reconstructed from the implementation stages in this project conversation. All listed stages occurred on **2026-11-02**; they are not claims of published GitHub releases or existing version tags.

### Unreleased

#### Current update — input timer, Alt Soft, letter-key game and library

- Fixed a browser receiver/brand error in the combination scheduler: default timer callbacks now invoke `globalThis.setTimeout/clearTimeout` through wrappers. This is the path shared by physical keys and mapping buttons, while on-screen piano notes use direct playback. Added a regression that rejects non-Window timer receivers; earlier unbranded mocks missed this case. A real Chromium-based browser check through a localhost preview confirmed physical-key event playback, mapping-button playback, and two consecutive practice hits with the 60 ms buffer enabled. Audible speaker output was not independently assessed; direct file-URL testing was unavailable.
- Added Last input / Last played note readouts and a visible keyboard-playback error state; reduced the misleading full-panel focus outline.
- Changed Soft to left/right Alt in both layouts; Shift remains the full-keyboard pitch modifier.
- Guided practice now prepares the first layout, shows physical key combinations beside the instrument, offers a quick start button, upcoming key cards, and hit/wrong-note feedback.
- Added a searchable, paginated 150-piece offline library, genre and estimated-difficulty filters, individual source links, and an optional melody-line import reducer.
- The 150 public-domain Mutopia source entries comprise 46 folk, 98 classical, and 6 dance/ragtime pieces. Scores use automatic lead-track/highest-note reduction, not manually reviewed arrangements or examination grading.
- Added eight title-only personal import slots for the requested Ghibli film music and Jay Chou songs. No corresponding copyrighted scores are bundled; browser-local imported scores stay outside the shared project.
- Added source tables, rebuild helpers, library-integrity checks, Alt-pedal and key-prompt checks. Existing input/audio/lesson checks remain in place. The localhost browser run produced Last played note C4/F3 for the tested key and mapping-button paths and recorded two practice hits, with no captured browser errors. This is not an independent assessment of the user’s speakers.

#### Added

- Mouse-wheel master-volume control over the instrument panel, with a default-on toggle, synchronized percentage/slider, smooth gain changes, and normal scrolling elsewhere.
- A Keyboard play focus button and input-status messages for ready, editing, loading, muted, and live-transcription states.

#### Fixed

- Instrument and starting-note selectors, settings pointer interactions, and on-screen piano clicks now return focus to the instrument instead of silently leaving computer-key input blocked.
- The first note key can initialize audio; later note keys resume suspended audio. Keys released during loading, or cancelled by focus loss/Escape, do not produce delayed ghost notes.
- Pointer notes track their own press/release contact, including release before audio preparation completes.
- Updated changed asset URLs to reduce stale runtime files after the new HTML is deployed.

#### Verification

- Automated checks now exercise keyboard event handling, first-key audio startup, suspended-context recovery, selector/piano focus return, preservation of score editing, wheel direction/bounds/toggle, and unchanged sounding-voice identity during volume changes. Existing instrument, lesson, transcription and timing checks remain applicable. Real-browser listening and device-specific behaviour still require manual verification.

#### Documentation

- Added this bilingual changelog and linked it from the README.
- Documented the distinction between per-note touch velocity, continuous expression, and master volume. Ordinary keyboard input does not provide touch velocity; holding a key longer does not reveal how hard it was pressed.
- Added a maintenance rule: record each subsequent update here, including its limitations and verification status.

### 2026-11-02 — Natural-note layout and modifier timing

#### Changed

- Replaced full-keyboard chromatic mapping with 45 ascending white-key natural notes. Shift raises the mapped note by one semitone. Default natural-note range: C1–E7, with F7 reachable using Shift.
- Reserved Shift for pitch in full-keyboard mode; Soft remains available through Fn or the on-screen pedal. Numbered mode keeps Shift as Soft.
- Added adjustable combination tolerance: 60 ms by default, 0–120 ms available. Note-on and note-off share the delay, preserving short taps and independent chord timing.
- Changed sustained-note transposition to smoothly adjust the existing sample source rather than replay its attack.
- Added release tolerance to reduce accidental unmodified tails when a modifier is released shortly before its note key.
- Adjusted piano key sizing for the wider natural-note range.

#### Verification and limits

- Automated checks cover modifier order, short taps, repeated notes, chords, release timing, source reuse, pending-note cancellation, and zero-delay mode.
- Greater tolerance adds latency. Events outside the chosen window can still produce unintended pitches. Real-browser listening remains unverified.

### 2026-11-02 — Instruments, guided practice, and transcription

#### Added

- Bundled sampled violin, cello, and flute sounds alongside piano, with instrument selection, credits, and upstream source information.
- Guided practice with illuminated piano/computer keys, wait-for-correct-note and fixed-tempo modes, demonstration playback, seeking, and restart.
- Built-in Twinkle, Twinkle, Little Star, text exercises, and an example JSON chord exercise.
- MIDI, uncompressed MusicXML, text, and JSON score import.
- Experimental local monophonic transcription: audio-file analysis, live transcription during file playback, microphone pitch detection, practice conversion, and editable JSON export.
- Five-minute / 50 MB audio limits, cancellation, and live-capture cleanup.
- Completed the README with English first and Chinese second; refreshed the GitHub upload package.

#### Verification and limits

- Automated checks cover instrument banks, practice progression, generated-signal pitch recognition, score/MIDI parsing, audio-import flow, live controls, and mocked microphone cleanup.
- Transcription detects one pitch at a time, not a complete polyphonic arrangement. Repeated notes may merge and pitches/timing require review.
- MusicXML uses the first part; MIDI uses pitched tracks. Practice uses fixed BPM; repeat expansion and tempo changes are not implemented. PDF/image score recognition is not included.
- Samples use a single layer and finite recordings; they do not provide full velocity-layer, continuous-bowing, or breath modelling. Real-browser audio, microphone, and visual compatibility need manual verification.

### 2026-11-02 — Bilingual interface and sampled piano

#### Changed

- Added English/Chinese interface switching with a saved language preference; English is the initial default.
- Replaced the original green interface with a black piano cabinet, ivory/ebony keys, brass accents, and red felt detail.
- Replaced oscillator piano synthesis with 29 bundled Salamander Grand Piano recordings and added brightness control.
- Added piano sample attribution and third-party license information.

### 2026-11-02 — Numbered-keyboard iterations

#### Changed

- Refined the numbered layout from numpad-only input to both top-row and numpad 1–7, supporting mixed chords and independent note releases.
- Finalized 1–7 as do–si, ↑/↓ as octave up/down, and ←/→ as semitone down/up. Opposing arrows cancel and octave/semitone modifiers combine.
- Replaced earlier +/− and Shift/Ctrl pitch controls with the arrow design; Shift/Ctrl returned to pedal duties in numbered mode.
- Consolidated application files in the `keyboard2piano` folder.

### 2026-11-02 — Initial prototype

#### Added

- Offline browser instrument with a 45-key chromatic main layout and a separate numbered numpad layout.
- Adjustable starting octave and volume, chords, clickable piano keys, simulated Quiet/Soft/Sustain pedals, and Fn fallback.
- All-notes-off, Escape handling, and focus-loss cleanup.
- Initial Chinese usage notes, automated core checks, README, ignore rules, GitHub Pages marker, and an upload ZIP.

### How to maintain this log

For every future update, add concise entries under **Unreleased** using **Added**, **Changed**, **Fixed**, and **Known limitations / Verification** as appropriate. Record only completed changes; label proposed work as planned. When publishing a release, move its entries to a dated version heading matching the actual tag. Documentation-only changes do not imply that audio or browser tests were rerun.

## 简体中文

本文件记录本地开发变化。以下历史根据本项目对话中的实际实现阶段整理，均发生于 **2026-11-02**，不代表这些阶段已经在 GitHub 发布，也不代表已有对应版本标签。

### 尚未发布

#### 本次更新 — 计时器修复、Alt 柔音、字母键音游与曲库

- 修复组合输入计时器调用浏览器接口时的接收对象错误，使用包装函数正确调用 globalThis.setTimeout/clearTimeout。实体按键和映射按钮都经过此路径，屏幕钢琴则直接发声。新增会拒绝错误接收对象的回归检查；早先的模拟计时器漏测了此问题。已通过本机网页预览，在真实浏览器验证开启 60 毫秒缓冲时的键盘事件、映射按钮发音触发与连续两次跟弹命中；未独立评估扬声器听感，直接 file 地址测试不可用。
- 新增“最近输入／最近发音”和可见的键盘发音错误提示，减弱容易被误解的整块琴身焦点框。
- 两种模式的柔音统一改为左右 Alt；第一模式的 Shift 继续控制升半音。
- 跟弹自动准备第一模式，在琴键旁显示字母及 Shift 组合，提供快捷开始、后续按键卡片、命中与错音反馈。
- 新增可搜索、分页的 150 首离线曲库，支持类型、估计难度筛选和逐曲来源链接；导入时可选择单旋律提取。
- 150 个公共领域来源条目含 46 首民谣、98 首古典、6 首舞曲／拉格泰姆，旋律按主轨／同刻最高音自动提取，不是人工校订改编或考级分级。
- 新增 8 个宫崎骏电影配乐及周杰伦歌曲的标题型自备谱入口，不内置对应版权乐谱；用户导入的个人谱子保存在浏览器，不进入公开项目。
- 加入曲库来源表、重建工具、150 首完整性检查，以及 Alt 踏板与字母提示检查。本机预览的真实浏览器记录到 C4/F3 发音触发与两次练习命中，未捕获浏览器错误；这不代表独立验证了用户扬声器输出。

#### 新增

- 琴身区域内滚轮控制整体音量，默认开启并可关闭；百分比与滑块同步，平滑影响持续音，其他区域仍正常滚动。
- “键盘演奏”焦点按钮与就绪、编辑、加载、静音、实时扒谱状态提示。

#### 修复

- 选择乐器、起始音、操作设置控件及点击屏幕琴键后返回演奏焦点，避免控件持有焦点时电脑键盘被静默忽略。
- 首次按发音键可启动声音，后续按键可恢复被暂停的音频；加载期间已松开或因失焦、Esc 取消的按键不会延后突然发声。
- 每个指针单独记录按下与松开，包含音色加载完成前已松开的情况。
- 更新已变更资源的地址版本，减少新版 HTML 部署后仍引用旧脚本的情况。

#### 验证

- 新增自动检查覆盖真实处理函数的键盘事件路径、首次按键启动、暂停后恢复、选择器及琴键焦点返回、谱子编辑不被抢占、滚轮方向与边界及关闭选项、调音量时保持原发声源。实际浏览器试听与设备兼容性仍需人工确认。

#### 文档

- 新增英文在前、中文在后的更新日志，并在 README 中加入入口。
- 补充单音触键力度、持续表情控制和总音量的区别。普通电脑键盘输入不提供触键力度，按住时间也不能代表按得多重。
- 约定今后每次更新记录已完成改动、限制与验证状态。

### 2026-11-02 — 自然音布局与组合键容错

#### 变更

- 主键盘从连续半音改为 45 个白键自然音，Shift 升半音。默认自然音范围 C1–E7，按住 Shift 可到 F7。
- 主键盘模式的 Shift 专用于音高；柔音可通过 Fn 或界面按钮控制。数字模式中 Shift 仍控制柔音。
- 新增组合容错，默认 60 毫秒，可调 0–120 毫秒；发音和松键采用相同偏移，保留短促点按及和弦各音独立计时。
- 持续音变调沿用原采样平滑改变音高，不再重复起音。
- 加入松键容错，减少修饰键稍早松开产生的原音尾巴。
- 调整更宽音域下的黑白琴键尺寸与位置。

#### 验证与限制

- 自动检查覆盖按键先后、短按、重复音、和弦、松键时序、发声源复用、待发音取消及零延迟模式。
- 容错越大，延迟越明显；超出窗口的不同步仍可能造成错音。实际浏览器试听尚未完成验证。

### 2026-11-02 — 多乐器、跟弹教学与扒谱

#### 新增

- 在钢琴之外加入小提琴、大提琴、长笛录音采样，以及乐器选择、署名与上游来源说明。
- 发光琴键教学，支持等待弹对、固定节拍推进、示范试听、进度定位和从头开始。
- 内置《小星星》及文本练习、JSON 和弦示例。
- 支持 MIDI、未压缩 MusicXML、文本和 JSON 谱子导入。
- 实验性本地单旋律扒谱：音频文件分析、播放时实时识别、麦克风识别、转入练习及导出可编辑 JSON。
- 音频 5 分钟 / 50 MB 上限、取消操作与实时输入释放。
- 完成英文在前、中文在后的 README，并更新 GitHub 上传包。

#### 验证与限制

- 自动检查覆盖音源切换、教学推进、生成信号音高识别、谱子及 MIDI 解析、音频导入流程、实时控制和模拟麦克风释放。
- 扒谱一次只识别一个音，不是完整多声部转录；重复音可能合并，音高和节奏需人工复核。
- MusicXML 读取第一声部，MIDI 导入有音高轨道；练习使用固定 BPM，暂不展开反复和变速。不包含 PDF、图片识谱。
- 当前为单力度层、有限长度采样，不具备完整力度分层、持续拉弓或气息模型。实际浏览器的音频、麦克风和视觉兼容性仍需人工试用。

### 2026-11-02 — 双语界面与钢琴采样

#### 变更

- 加入中英切换并记住选择，初次默认英文。
- 绿色界面改为黑色琴身、黑白琴键、黄铜色点缀与红色毡条。
- 振荡器合成钢琴改为 29 个本地打包的 Salamander Grand Piano 录音，并新增明亮度调节。
- 加入采样来源、署名及第三方许可说明。

### 2026-11-02 — 数字模式迭代

#### 变更

- 从仅右侧小键盘扩展为上方数字行和右侧小键盘 1–7 均可用，支持混合和弦及独立松键。
- 确定 1–7 对应 do–si，↑/↓ 升降八度，←/→ 降升半音；反向抵消，八度和半音可以叠加。
- 早期 +/−、Shift/Ctrl 音高控制改为方向键；数字模式的 Shift/Ctrl 恢复踏板功能。
- 全部应用文件集中到 `keyboard2piano` 文件夹。

### 2026-11-02 — 初始原型

#### 新增

- 可离线使用的浏览器乐器，包含 45 键主键盘半音阶和独立数字小键盘模式。
- 起始音域与音量调节、和弦、可点击琴键、模拟弱音/柔音/延音踏板及 Fn 备用方案。
- 全部止音、Esc 与切换窗口后的清理。
- 初版中文说明、核心逻辑自动检查、README、忽略规则、GitHub Pages 标记及上传 ZIP。

### 后续维护约定

今后每次更新先在「尚未发布」下记录「新增、变更、修复、限制 / 验证」，只把已经完成的工作写为已实现，设想需标为计划。正式发布时，再移到与真实标签一致的版本号和日期下。仅文档更新不代表重新完成音频或浏览器测试。
