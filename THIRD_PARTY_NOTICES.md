# Piano recordings / 钢琴录音

**Salamander Grand Piano v3** by **Alexander Holm**.

- Original collection: https://archive.org/details/SalamanderGrandPianoV3
- Author and license: https://github.com/sfzinstruments/SalamanderGrandPiano
- MP3 distribution: https://github.com/Tonejs/audio/tree/master/salamander
- License: **Creative Commons Attribution 3.0 Unported (CC BY 3.0)**
- License terms: https://creativecommons.org/licenses/by/3.0/legalcode

`samples.js` bundles 29 MP3 recordings (C1–C8, sampled every minor third) from the Tone.js distribution, encoded as base64 without changing the MP3 audio. During playback, nearby pitches are resampled and gain, filtering, and release envelopes are applied. This is a single-layer playback bank, not the complete original 16-velocity-layer instrument. The original author does not endorse this project.

The recordings retain their CC BY 3.0 license, independently of any license applied to this project's application code. Keep this attribution and license link with redistributed copies.

`samples.js` 包含 Alexander Holm 创作的 Salamander Grand Piano v3 钢琴录音，来自 Tone.js 的 MP3 分发版本。29 个采样按小三度间隔覆盖 C1–C8，以 base64 形式打包；MP3 内容未修改。播放时对邻近音进行变调，并施加音量、滤波及释音包络。这是单力度层音库，并非原始 16 力度层完整音源。原作者未为本项目背书。

录音独立遵循 CC BY 3.0，不随应用代码的许可变更。再分发时请保留本署名及许可链接。

## Violin, cello and flute / 小提琴、大提琴与长笛

`instrument-samples.js` bundles MP3 recordings distributed by **N. P. Brosowsky**, [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments): 14 violin, 34 cello, and 10 flute samples. The sample distribution is licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/legalcode). Upstream source and recording credits are preserved in [SAMPLE_SOURCES.txt](SAMPLE_SOURCES.txt).

MP3 content is unchanged and base64-encoded for offline use. Playback resamples neighbouring pitches and applies gain, filtering and release envelopes. These are finite recordings, not a complete continuously bowed or breath-modelled instrument. No endorsement by the sample providers is implied. Keep these notices and the upstream source credits when redistributing. No Tone.js runtime or loader code is included.

小提琴、大提琴与长笛采用 N. P. Brosowsky 的 tonejs-instruments 项目所分发的录音采样，遵循 CC BY 3.0；原始录音来源说明保留在 SAMPLE_SOURCES.txt 中。MP3 内容未修改，仅编码打包；播放时进行邻近音变调、音量及滤波处理。每个音的长度受原始录音时长限制，并非持续拉弓或吹奏模型。再分发时请保留本说明及上游来源文件。

## Song library / 曲库

The 150 built-in song entries are derived from Mutopia MIDI editions explicitly marked Public Domain in the source catalogue. Per-piece title, composer, source and MIDI links are retained in [SONG_SOURCES.md](SONG_SOURCES.md) and the data file. Melody reduction and difficulty estimation are automated; no original editor endorsement is implied. Personal copyrighted-song import slots include no score data and are not part of this source collection.

150 首内置曲库来源版本在 Mutopia 目录中明确标为公共领域，逐曲来源、标题、作曲者与原 MIDI 链接保留于 SONG_SOURCES.md 及数据文件。旋律提取、难度估计为自动处理，原整理者未为本软件背书。自备版权歌曲入口没有内置谱子数据，不属于此公开来源集合。
