# 🔊 音效系統

> `src/hooks/useSound.js` — 使用 Web Audio API 生成音效，零外部音檔依賴

## 概述

本專案的音效完全由 **Web Audio API** 即時合成，不需要載入任何 `.mp3` / `.wav` 音檔。透過控制震盪器 (Oscillator) 的頻率、波形、音量與持續時間，產生各種互動音效。

## 音效列表

| 方法 | 用途 | 頻率 | 波形 | 說明 |
|------|------|------|------|------|
| `playCorrect()` | 答對 | C5 → E5 → G5 | sine | 三音上升音階，間隔 100ms |
| `playWrong()` | 答錯 | 200 Hz | square | 低沉單音，方波音色 |
| `playClick()` | 點擊 | 440 Hz (A4) | sine | 短促點擊音，80ms |
| `playWin()` | 過關 | C5~C6 八音階 | sine | 8 個音符依序播放的勝利旋律 |
| `playPop()` | 戳破 | 600~1000 Hz | sine | 隨機高頻 pop 音效 |

## API

```javascript
const { playCorrect, playWrong, playClick, playWin, playPop } = useSound()
```

## 技術原理

### 基礎 `playTone` 函數

```javascript
playTone(frequency, duration, type, volume)
```

1. 建立 `OscillatorNode` 設定頻率與波形
2. 建立 `GainNode` 控制音量，並使用 `exponentialRampToValueAtTime` 做漸弱效果
3. 連接：`Oscillator → Gain → AudioContext.destination`
4. 設定開始與結束時間

### AudioContext 管理

- 使用 `window.AudioContext`（或 `webkitAudioContext`）
- 若瀏覽器因自動播放政策暫停了 AudioContext（`state === 'suspended'`），會自動呼叫 `resume()`

## 測試模擬

測試環境中 (`src/test/setup.js`)，提供 `MockAudioContext` 替代：

```javascript
class MockAudioContext {
  createOscillator() { /* 回傳 mock 物件 */ }
  createGain() { /* 回傳 mock 物件 */ }
  // ...
}
window.AudioContext = MockAudioContext
```

各遊戲測試再透過 `vi.mock('../../hooks/useSound')` 將整個 hook 替換為 `vi.fn()`。
