# 🗣️ 語音朗讀系統

> `src/hooks/useSpeak.js` — 使用 Web Speech API 提供語音朗讀功能

## 概述

本專案的語音功能由 **Web Speech API** 的 `SpeechSynthesis` 介面驅動，無需任何外部音訊檔案或雲端 TTS 服務，直接使用瀏覽器內建語音引擎合成語音。

## 主要用途

- 進入遊戲關卡時自動語音說明（如「一起來認識注音符號吧！」）
- 學習模式中自動朗讀例字，幫助尚未識字的幼兒理解題目
- 用戶點擊 🔊 按鈕主動朗讀

## API

```javascript
const { speak, speakZh, speakEn, speakDelayed, stopSpeak } = useSpeak()
```

| 方法 | 說明 |
|------|------|
| `speak(text, lang)` | 播放指定語言語音，預設 `zh-TW` |
| `speakZh(text)` | 播放中文語音（`zh-TW`） |
| `speakEn(text)` | 播放英文語音（`en-US`） |
| `speakDelayed(text, lang, delay)` | 延遲播放（預設 500ms），用於進入關卡時的說明 |
| `stopSpeak()` | 停止當前語音播放 |

## 語音參數

```javascript
utterance.lang = 'zh-TW'  // 或 'en-US'
utterance.rate = 0.8       // 語速（0.8 = 略慢，適合幼兒）
utterance.pitch = 1.1      // 音調（略高，聽起來更友善）
```

## 技術細節

- 每次播放前先呼叫 `window.speechSynthesis.cancel()` 中斷上一段語音
- 元件卸載時自動清除 timeout 並停止語音
- 若瀏覽器不支援 `window.speechSynthesis`，函數靜默忽略（不報錯）

## 瀏覽器支援

| 瀏覽器 | 支援 | 備註 |
|--------|------|------|
| Chrome | ✅ 最佳 | 支援 zh-TW 語音 |
| Edge | ✅ 良好 | 支援 zh-TW 語音 |
| Firefox | ⚠️ 部分 | 語音引擎依系統而定 |
| Safari | ✅ 良好 | iOS/macOS 支援 |

## 測試模擬

測試環境中透過 `vi.mock` 將整個 hook 替換為 mock 函數：

```javascript
vi.mock('../../hooks/useSpeak', () => ({
  useSpeak: () => ({
    speak: vi.fn(),
    speakZh: vi.fn(),
    speakEn: vi.fn(),
    speakDelayed: vi.fn(),
    stopSpeak: vi.fn(),
  }),
}))
```
