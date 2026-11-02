# keyboard2piano · 键间

[English](#english) · [简体中文](#简体中文) · [Changelog / 更新日志](CHANGELOG.md)

## English

Turn your computer keyboard into an instrument. **keyboard2piano** is an offline-ready browser instrument with real piano, violin, cello, and flute recordings, two keyboard layouts, guided practice, and experimental melody transcription. The interface switches between English and Chinese and remembers your choice.

### Start playing

Download the complete project and open `index.html` in a current desktop browser, then press a note key or click **Enable sound**. On the first use, samples need a moment to prepare; hold the key or play again when ready. Edge or Chrome with an English keyboard input method is recommended. No account, build step, or runtime download is needed. Keep `samples.js` and `instrument-samples.js` alongside the other application files.

Select an instrument and adjust volume and brightness. With **Wheel controls volume** enabled, scroll over the piano panel: up is louder, down is softer. The percentage display and slider stay in sync, and smooth gain changes affect all sounding notes. Turn the option off to restore normal scrolling over the panel. Other page sections still scroll normally. The black piano cabinet, ivory keys, and gold practice lights share the same controls in both languages.

### If the computer keyboard is silent

Computer keys and mapping buttons share the combination timer; that timer now calls browser APIs through their Window receiver, fixing the borrowed-method error missed by the original mocks. Last input / Last played note readouts distinguish receiving a key from starting an audio source.

Changing the instrument/starting note, releasing a settings slider, or clicking a piano key returns focus to the instrument. You can also click **Keyboard play** at any time. Typing in a score, BPM field, or file selector intentionally does not play notes; the input status tells you when you are editing. Musical keys can play even after a range slider had focus, while navigation keys still adjust a focused slider.

The first note key starts audio automatically; suspended audio is resumed on the next note. A key released during loading will not unexpectedly sound later. Check the volume percentage if it is muted. Live transcription temporarily blocks instrument playback; stop it before playing. If a hosted copy is missing controls or has a loading error, upload the complete updated project and refresh the page.

### Keyboard layouts

**Full keyboard:** 45 physical keys form ascending natural (white-key) notes, following the Z row (Z–/), A row (A–'), Q row (Q–]), then number row (1–=). The default natural-note range is C1–E7 (F7 with Shift). Hold Shift to raise each key by one semitone. Natural notes follow C D E F G A B; E–F and B–C are already semitone intervals, not whole steps. Starting C is adjustable from C0 to C5. Punctuation uses physical keys. Shift is reserved for raising pitch, not typing punctuation.

**Numbered notes:** both the top number row and right-hand numpad work, including mixed chords. The default do is middle C (C4).

| Key | Action |
| --- | --- |
| 1–7 | do, re, mi, fa, sol, la, si |
| ↑ / ↓ | Up / down one octave |
| ← / → | Down / up one semitone |
| Ctrl | Quiet: reduce volume |
| Alt | Soft: gentler tone (both layouts) |
| Space | Sustain |
| Esc | Stop all notes, practice, and transcription |

Hold arrows to modify pitches; releasing them restores the original pitch. Octave and semitone modifiers combine; opposite arrows cancel. Changes also affect notes already held. Enable Num Lock when using the numpad. Pedal buttons can latch the effects. Leaving the window stops played notes and pauses practice.

### Avoiding accidental notes from modifier timing

**Combo tolerance** defaults to **60 ms**, adjustable from 0 to 120 ms. A note waits briefly so a slightly late Shift or arrow key can be included before its attack. Note-off uses the same offset: short taps are preserved, and independent chord notes do not postpone one another. Releasing a modifier shortly before its note key no longer creates a brief unmodified tail within this window.

For deliberate changes to an already sounding note, the same sample source changes pitch smoothly; the app does not replay its initial attack. Your hold-arrow-and-number design stays the same. This reduces accidental notes, not all possible timing errors: events farther apart than the chosen window can still produce the original pitch. A larger window is more forgiving but adds latency; use 0 ms for immediate response.

### Guided practice

- Start with **Twinkle, Twinkle, Little Star**, or open **Song library** to choose from 150 offline pieces. Practice prepares the first keyboard layout automatically.
- The game prompt above the keyboard gives physical letter keys such as **G** or **Shift + G**, with upcoming key cards and hit/wrong-note counts. Use its quick Start button to keep the piano and guidance together.
- **Wait for correct notes:** the current notes glow on the piano and matching computer keys. Play the complete target chord to advance; release and press again for repeated notes. Rests are skipped in this mode.
- **Follow tempo:** the score advances at the chosen BPM, including rests and gaps. Adjusting BPM pauses practice; restart at the new tempo.
- Use **Listen** for a demonstration, the note cards or position slider to seek, and **Restart** to return to the beginning.
- In numbered mode, use arrows to reach the highlighted pitch. Computer keys glow when the current arrow combination matches it. If the target is outside the visible range, change the starting note or keyboard mode.

Import MIDI (`.mid` / `.midi`), uncompressed MusicXML (`.musicxml` / `.xml`), text (`.txt`), or the JSON format below, up to 5 MB. The default melody-import option selects a likely lead MIDI track and retains the highest note at each onset. Uncheck it to keep all pitched tracks/chords; channel 10 percussion is omitted; MusicXML uses the first part. Practice uses a fixed BPM: tempo changes, repeat expansion, expressive articulations, and full score engraving are not implemented. PDF, compressed MXL, and score images are not supported. The teaching strip shows note events rather than engraved staff notation.

Write simple exercises directly:

```text
1 2 3 4 #4 5:2 0 C5:0.5
```

A colon sets duration in quarter-note beats; `0` or `R` is a rest. Add `'` after numbered notes for an octave up or `,` for an octave down. Text numbered notation uses C4 as do. Note names such as `C4`, `F#4`, and `Bb3` are also accepted.

Editable JSON score format (MIDI numbers, beat-based timing):

```json
{
  "title": "My exercise",
  "bpm": 100,
  "events": [
    { "beat": 0, "duration": 1, "notes": [60] },
    { "beat": 1, "duration": 2, "notes": [60, 64, 67] },
    { "beat": 3, "duration": 1, "notes": [] }
  ]
}
```

### Song library

The offline library contains **150 distinct playable source pieces**: **46 Folk**, **98 Classical** (including Baroque), and **6 Dance / ragtime**. Search by title/composer and filter by genre and estimated difficulty. Each card links to its source. Scores are automatically reduced from MIDI to a single line; they are not manually proofread arrangements or official graded repertoire. All 150 pass score/range checks, and source editions are explicitly labelled Public Domain in Mutopia's catalogue. See [SONG_SOURCES.md](SONG_SOURCES.md) for per-piece provenance.

Film/anime and pop categories additionally provide **eight personal-import slots** for the requested Ghibli films and Jay Chou songs. These slots contain titles and import controls only, not copyrighted melodies or accompaniment. Import a MIDI, MusicXML, or JSON score you have permission to use. The score is saved in that browser's local storage when available and is not written into the project or its upload package. Export/backup your source file separately. These eight slots are not counted among the 150 built-in playable pieces.

Authoring helpers in `scripts/` rebuild the Mutopia catalogue using Python/BeautifulSoup and Node.js; users do not need those dependencies to play.

### Audio-to-notes: experimental

Choose an audio file for local analysis with incremental results. After decoding, **Play & transcribe live** plays the imported audio and rebuilds its transcription in real time. **Use microphone** detects a live solo melody. Stop, review the results, then **Practise these notes** or **Export editable JSON** to correct and re-import them.

This is a browser-local, monophonic pitch detector, **not a full polyphonic arrangement transcription model**. It works best with clean solo recordings or humming. It detects one pitch at a time, approximately A1–F♯6; it does not separate instruments or chords. Repeated notes without clear gaps can merge, overtones can cause octave errors, and pitch/timing need manual review. It does not infer key signatures, fingering, meter, or a finished engraved score.

Files are limited to 5 minutes and 50 MB and remain on your device. Browser-supported audio formats such as WAV and MP3 can be used. Microphone access requires permission and a supported secure context (HTTPS or localhost); file import remains an alternative. Wear headphones. Leaving the window stops live microphone capture or live file playback, and capture also stops after five minutes. No recorded audio is retained or uploaded; the app keeps detected note events in memory until reload.

### Sound and credits

- Piano: **Salamander Grand Piano v3**, Alexander Holm; MP3 distribution from Tone.js, CC BY 3.0.
- Violin, cello, flute: the **tonejs-instruments** sample distribution by N. P. Brosowsky, CC BY 3.0. Upstream recording credits are in `SAMPLE_SOURCES.txt`.

Samples are bundled as base64 for offline playback, not generated oscillators. Nearby pitches are resampled. This is a single-layer bank; string/wind notes end when their finite recording ends. It does not model continuous bowing, breathing, or acoustic pedal mechanics. Keep [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `SAMPLE_SOURCES.txt` when redistributing; sample licenses are independent of the application code license.

Computer keyboards have no touch velocity, simultaneous-key limits depend on hardware. System/browser shortcuts can interrupt playing. Desktop use is the primary target. Automated checks use simulated audio/DOM objects and generated signals. A real-browser localhost preview additionally verified keyboard/mapping-button audio-source triggering and consecutive practice hits; speaker listening, direct file-URL behaviour, and microphone compatibility are not fully verified. [Interface preview](preview.jpg).

### Touch dynamics and expression

Ordinary computer keyboard events expose key-down/key-up and modifier state, not touch velocity or pressure. Holding a key longer measures note duration, not attack strength. Software cannot recover a per-note force measurement that the hardware never reports. See the [keyboard event specification](https://www.w3.org/TR/uievents/#interface-keyboardevent).

Three concepts matter: **per-note attack dynamics** affect the newly played note; **continuous expression** shapes a sustained phrase; **master volume** scales all currently sounding notes. Realistic piano dynamics also involve attack and timbre, not only loudness. The current application offers wheel-controlled master volume and Quiet/Soft effects, with single-layer samples; it does not yet support MIDI input or independent per-note velocity.

Possible future controls include soft/medium/loud attack presets captured separately for each new note, continuous expression through an external pedal, and velocity-sensitive MIDI keyboard input. These are design options, not implemented features. True touch response requires input hardware that actually reports it.

### Development checks

The application has no runtime dependencies. With Node.js:

```sh
node --check app.js
node --check teaching.js
node --check transcription.js
node check.cjs
node check-core.cjs
node check-input.cjs
node check-library.cjs
```

Checks cover mappings, bilingual labels, instrument-bank switching, chords, pedals, octave/semitone combinations, lesson progression, score/MIDI parsing, generated-signal pitch recognition, and note segmentation.

### Publish on GitHub Pages

Put the project files at the repository root. In **Settings → Pages**, choose **Deploy from a branch**, your branch, and **/ (root)**. Keep the two sample JavaScript files and all third-party credits in the published project. The browser app needs no server-side account or API key.

### Updating an existing GitHub repository

For a browser upload, open your repository and choose **Add file → Upload files**. Upload the contents of the updated project into the same paths as the existing files, review the replacements, write a short commit message, and submit. Extract the ZIP first: uploading the ZIP alone does not update the running application. Keep the existing repository license file if it is not part of this local package. GitHub Pages rebuilds from its configured publishing branch.

For repeated updates, GitHub Desktop is more convenient: clone the existing repository once into an empty folder, copy this project's files into that clone, review changes, commit, and **Push origin**. Do not overwrite the clone's `.git` directory.

## 简体中文

把电脑键盘变成随手可弹的乐器。**keyboard2piano · 键间** 提供钢琴、小提琴、大提琴和长笛录音音色、两种按键布局、发光琴键跟弹与实验性单旋律扒谱。界面可切换中英两种语言，并记住选择。

### 开始演奏

下载完整项目，使用新版桌面浏览器打开 `index.html`，按下发音键或点击 **开启声音**；首次需短暂准备采样，可按住发音键，或就绪后重新弹奏。建议使用 Edge 或 Chrome，切换至英文输入法。无需注册、安装依赖或运行构建，下载后可离线使用。请保留 `samples.js` 和 `instrument-samples.js`。

选择乐器，调节音量与明亮度。开启 **滚轮控制音量** 后，鼠标停在琴身区域，向上滚动更响、向下更轻；百分比和滑块同步更新，正在持续的音也会平滑变化。关闭选项后恢复琴身区域的普通滚动，其他页面区域始终正常滚动。界面使用黑色琴身、象牙白琴键和金色教学提示。

### 电脑按键无声时

电脑按键和映射按钮共用的组合计时器已改为正确调用浏览器接口，修复原模拟检查漏掉的调用上下文错误。“最近输入／最近发音”可区分收到按键与实际触发音源；外框焦点提示本身不代表发声。

选择乐器或起始音、松开设置滑块、点击屏幕琴键后，焦点会返回乐器；也可随时点击 **键盘演奏**。编辑谱子、BPM 或选择文件时，键盘用于编辑，不触发发音；输入状态会提示当前状态。调节滑块后，字母等发音键仍可用于演奏，方向键在滑块有焦点时保留调节功能。

首次按发音键会自动启动声音；声音被浏览器暂停后，下次发音键会尝试恢复。若加载期间已经松键，就绪后不会突然补响。无声时也请检查音量百分比，实时扒谱开启时需先停止再演奏。若线上版本缺少控件或报加载错误，请上传完整新版并刷新页面。

### 两种演奏模式

**主键盘自然音：** 从 Z 行（Z–/）、A 行（A–'）、Q 行（Q–]）到数字行（1–=）连续排列 45 个白键自然音，默认覆盖 C1–E7（按住 Shift 可到 F7），起始 C 可在 C0–C5 之间调整。按住 Shift 将对应音升半音，标点仍按物理键位识别。这里的自然音为 do、re、mi、fa、sol、la、si，其中 mi–fa、si–do 本来就是半音，并非每两个键都相隔全音。

**数字简谱：** 主键盘上方数字行与右侧数字小键盘均可使用，也能混合弹奏，默认 do 为中央 C（C4）。

| 按键 | 功能 |
| --- | --- |
| 1–7 | do、re、mi、fa、sol、la、si |
| ↑ / ↓ | 升 / 降八度 |
| ← / → | 降 / 升半音 |
| Ctrl | 弱音：降低音量 |
| Alt | 柔音：柔化音色（两种模式通用） |
| 空格 | 延音 |
| Esc | 停止全部音符、练习和扒谱 |

方向键按住生效、松开恢复，也能改变正在按住的音。八度与半音可组合，反向同时按住则抵消。右侧小键盘建议开启 Num Lock。踏板可通过界面按钮锁定。离开窗口会停止弹奏并暂停练习。

### 减少组合键不同步造成的错音

**组合容错**默认 **60 毫秒**，可调范围 0–120 毫秒。发音前短暂等待，将稍晚按下的 Shift 或方向键合并进去；松键同样偏移，短促点按不会被吞掉，各个和弦音有独立计时。方向键稍早松开时，只要数字键也在容错时间内松开，就不会出现突然回到原音的尾巴。

对已经持续发声的音，软件沿用原采样连续改变音高，不再重放击弦或起音。按住方向键配合数字键的设计不变。但软件无法预知很晚才到达的修饰键：按键间隔超出容错时间仍可能先听到原音；容错越大，延迟也越明显。需要即时响应时可调至 0 毫秒。

### 教学与谱子导入

- 可直接练习《小星星》，或展开曲库选择 150 首内置曲目；练习会自动准备第一种键盘模式。
- 键盘上方直接显示 **G**、**Shift + G** 等物理按键；音符卡片显示后续按键，并提供命中、错音反馈及快捷开始按钮。
- **等待弹对：** 钢琴及对应电脑按键发光提示当前目标，弹齐当前音或和弦后进入下一组。重复音需要松开后重新按下；本模式跳过休止符。
- **跟随节拍：** 按设定 BPM 推进，保留谱面的休止和间隔。更改 BPM 会暂停练习，重新开始即可使用新速度。
- 支持示范试听、从头开始、点击音符卡片或拖动进度定位。
- 数字模式可配合方向键到达目标音高；电脑按键在方向键组合匹配目标时发光。音域不足时可调整起始音或切换模式。

支持导入 MIDI、未压缩 MusicXML、文本及上面的 JSON 谱子，最大 5 MB。默认勾选单旋律导入，会选取可能的 MIDI 主旋律轨并保留同一时刻最高音；取消勾选可保留全部有音高轨道与和弦，第 10 通道打击乐被忽略；MusicXML 读取第一乐器声部。使用固定 BPM，不展开反复记号、变速及复杂演奏法；目前展示音符进度卡片，不是完整五线谱排版。暂不支持 PDF、图片和压缩 MXL 识谱。

简谱示例：`1 2 3 4 #4 5:2 0 C5:0.5`。冒号后为拍数，`0/R` 为休止。简谱数字后加 `'` 升八度、加 `,` 降八度，文本简谱的 do 固定为 C4。也可使用 `C4`、`F#4`、`Bb3` 等音名；和弦可通过 JSON 或 MIDI 导入。

### 分类曲库

内置 **150 首独立来源的可弹曲目**：**46 首民谣、98 首古典（含巴洛克）、6 首舞曲／拉格泰姆**。支持曲名、作曲者搜索，以及类型和估计难度筛选；每首附原始来源链接。旋律由 MIDI 自动提取，不是逐首人工校订的改编谱，也不是正式考级曲目。150 首均通过谱子和音域检查；来源版本在 Mutopia 目录中明确标为 Public Domain。逐曲来源见 [SONG_SOURCES.md](SONG_SOURCES.md)。

「电影／动漫」「流行」另有你提出的四部宫崎骏电影及四首周杰伦歌曲的 **8 个自备谱入口**，只有标题和导入按钮，未打包对应受版权保护的旋律或伴奏。导入你有权使用的 MIDI、MusicXML 或 JSON 后，可在本浏览器保存；个人谱不会写入公开项目或上传包。请自行保留原文件备份。这 8 项不计入 150 首内置可弹曲目。

`scripts/` 中有从 Mutopia 重建曲库的开发工具，需要 Python、BeautifulSoup 和 Node.js；普通使用无需安装这些依赖。

### 音频扒谱：实验功能

导入音频后在本地分析，逐步显示结果与进度。解码后可选择 **播放并实时扒谱**，一边播放导入音频、一边重新识别音符；也可开启麦克风实时识别。停止后先检查音符，再转入跟弹，或导出 JSON 修改后重新导入。

这是浏览器内的**单音高识别器，并非完整多声部自动扒谱模型**。适合清晰的独奏、哼唱或单乐器旋律，一次识别一个音，范围约 A1–升 F6；不能分离伴奏、和弦和多乐器混音。连续重复音可能合并，泛音可能造成八度误判，音高与节奏均需复核。暂不自动判断调号、拍号、指法或生成排版后的五线谱。

音频上限 5 分钟 / 50 MB，支持浏览器可解码的 WAV、MP3 等格式；文件不上传。麦克风需浏览器授权及 HTTPS 或 localhost 等受支持的安全环境，也可改用文件导入。建议戴耳机。离开窗口会停止麦克风或实时音频播放，麦克风最长运行五分钟。不会保存或上传录音，只在本页内存中保留已识别音符，刷新即清除。

### 音色、许可与限制

钢琴为 Alexander Holm 的 Salamander Grand Piano v3 录音；小提琴、大提琴和长笛来自 N. P. Brosowsky 的 tonejs-instruments 采样分发版本。均附 CC BY 3.0 说明，原始录音来源保留于 `SAMPLE_SOURCES.txt`。请随项目保留 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和该来源文件；音源许可独立于应用代码许可。

所有音源随软件打包，不依赖实时下载，也不是振荡器合成音。邻近音采用变调播放，当前为单力度层，弦乐和管乐时长受原录音长度限制，并非持续拉弓或气息模型；踏板为模拟效果。

普通键盘不支持力度感应，多键同时识别数量取决于硬件。Alt 控制柔音，Shift 在第一模式中专门用于升半音。系统快捷键可能中断弹奏。软件主要面向桌面端；真实浏览器本机预览已验证电脑按键、映射按钮触发音源及连续跟弹命中；自动检查仍不替代扬声器试听、直接 file 地址及麦克风兼容性验证。界面预览见 [preview.jpg](preview.jpg)。

### 力度与表情的边界

普通电脑键盘事件提供按下、松开和修饰键状态，不提供触键速度或压力。按住多久表示音符时长，不能推断按得多重；软件无法还原硬件没有上报的逐音力度。可参考 [键盘事件规范](https://www.w3.org/TR/uievents/#interface-keyboardevent)。

需要区分：**逐音起音力度**影响新弹下的音，**连续表情**控制持续音或乐句变化，**总音量**缩放所有正在发声的音。钢琴强弱还包含起音与音色差异，不能只靠调大调小音量完整还原。当前软件提供滚轮控制总音量、弱音和柔音效果，使用单力度层采样；尚未实现 MIDI 输入和独立逐音力度。

可考虑的后续方案包括：在每个新音触发时记录独立的轻/中/重力度档，用外接表情踏板进行连续表情控制，以及接入力度敏感的 MIDI 键盘。以上仅为设计选项，尚未实现；要真正响应触键动作，需要能够上报相应数据的输入硬件。

### 检查与发布

安装 Node.js 后运行英文部分列出的检查命令。将所有项目文件直接放到 GitHub 仓库根目录，在 **Settings → Pages** 选择 **Deploy from a branch**、对应分支与 **/ (root)** 即可发布。请保留音源文件及来源署名，无需服务端或 API Key。

### 更新已有 GitHub 仓库

网页方式：进入仓库，选择 **Add file → Upload files**，把新版项目中的文件按原有路径上传，确认替换内容，填写更新说明并提交。请先解压 ZIP，上传文件夹里面的内容到仓库根目录；只上传 ZIP 不会更新可运行网页。若仓库已有 LICENSE，而本地没有，请保留仓库中的 LICENSE。已配置 GitHub Pages 时，发布分支的更新会触发重新部署。

长期维护建议使用 GitHub Desktop：先把现有仓库克隆到空文件夹，将本项目文件复制到克隆目录中，检查变更、填写说明、提交，再点击 **Push origin**。不要覆盖克隆目录中的 `.git`。

## Changelog maintenance / 更新记录维护

See [CHANGELOG.md](CHANGELOG.md) for completed changes, known limits, and verification status. Add every subsequent change under Unreleased; only assign a release version after an actual release/tag exists.

每次后续更新在 [CHANGELOG.md](CHANGELOG.md) 的「尚未发布」部分记录已完成改动、限制与验证状态；实际发布后再归档到对应版本。
