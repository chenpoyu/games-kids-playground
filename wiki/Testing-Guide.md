# 🧪 測試指南

## 測試框架

- **Vitest** — 與 Vite 深度整合的測試框架
- **React Testing Library** — 以使用者行為為導向的 React 測試工具
- **jsdom** — 測試環境

## 執行測試

```bash
# 監聽模式（開發時使用）
npm test

# 一次性執行所有測試
npm run test:run

# 執行並產生覆蓋率報告
npm run test:coverage
```

> 📌 覆蓋率報告輸出至 `coverage/` 目錄，已加入 `.gitignore` 不納入版本控制。

## 測試結構

```
src/test/
├── setup.js                # 全域測試環境設定
├── App.test.jsx            # 路由測試
├── components/
│   ├── BackButton.test.jsx
│   ├── StarScore.test.jsx
│   └── WinModal.test.jsx
├── games/
│   ├── ABCLearn.test.jsx
│   ├── AnimalPuzzle.test.jsx
│   ├── BalloonPop.test.jsx
│   ├── ColorMatch.test.jsx
│   ├── NumberLearn.test.jsx
│   └── ShapeSort.test.jsx
├── hooks/
│   ├── useProgress.test.js
│   └── useSound.test.js
└── pages/
    ├── About.test.jsx
    ├── History.test.jsx
    └── Home.test.jsx
```

## 測試統計

| 分類 | 測試檔案 | 測試案例數 |
|------|----------|------------|
| 路由 | 1 | 9 |
| 元件 | 3 | 17 |
| 遊戲 | 6 | 71 |
| Hooks | 2 | 20 |
| 頁面 | 3 | 46 |
| **合計** | **15** | **163** |

## 覆蓋率

整體覆蓋率概況（截至 2026-02-28）：

| 分類 | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| 元件 | 100% | ~92%+ | 100% | 100% |
| 遊戲 | 60~96% | 52~88% | 50~94% | 61~98% |
| Hooks | 94% | 86% | 91% | 97% |
| 頁面 | 92~100% | 100% | 87~100% | 92~100% |

## 測試環境設定

### `src/test/setup.js`

1. **`@testing-library/jest-dom`** — 載入 DOM 斷言（`toBeInTheDocument()` 等）
2. **MockAudioContext** — 模擬 Web Audio API，避免在 jsdom 中報錯
3. **Mock canvas-confetti** — 模擬撒花效果

### 常見 Mock 模式

每個遊戲測試都會 mock 以下 hooks：

```javascript
// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock useSound
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playClick: vi.fn(),
    playWin: vi.fn(),
    playPop: vi.fn(),
  }),
}))

// Mock useSpeak
vi.mock('../../hooks/useSpeak', () => ({
  useSpeak: () => ({
    speak: vi.fn(),
    speakZh: vi.fn(),
    speakEn: vi.fn(),
    speakDelayed: vi.fn(),
    stopSpeak: vi.fn(),
  }),
}))

// Mock ProfileContext
vi.mock('../../contexts/ProfileContext', async () => {
  const actual = await vi.importActual('../../contexts/ProfileContext')
  return {
    ...actual,
    useProfile: () => ({
      activeProfile: { levelProgress: {}, unlockedGames: [] },
      recordGame: vi.fn(),
    }),
  }
})
```

## 撰寫新測試的建議

1. **測試檔案命名**：與原始檔案同名，加 `.test` 後綴
2. **放置位置**：`src/test/` 下對應子目錄
3. **使用 MemoryRouter**：測試 React Router 相關元件時需包裹
4. **Fake Timers**：含 `setTimeout` 的互動邏輯需使用 `vi.useFakeTimers()` + `vi.advanceTimersByTime()`，測試結束記得 `vi.useRealTimers()`
5. **DOM 查詢**：優先使用 `screen.getByText` / `screen.getByRole`，必要時才用 `document.querySelectorAll`
6. **新遊戲測試**：需額外 mock `useSpeak` 與 `ProfileContext`（相較舊遊戲增加的依賴）

```javascript
// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock useSound
vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playClick: vi.fn(),
    playWin: vi.fn(),
    playPop: vi.fn(),
  }),
}))

// Mock useProgress
vi.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({
    progress: { totalStars: 0, gamesPlayed: 0, history: [], achievements: [], lastPlayed: null },
    recordGame: vi.fn(),
    resetProgress: vi.fn(),
    getGameStats: vi.fn(() => ({ totalPlayed: 0, bestStars: 0, avgStars: 0 })),
  }),
}))
```

## 撰寫新測試的建議

1. **測試檔案命名**：與原始檔案同名，加 `.test` 後綴
2. **放置位置**：`src/test/` 下對應子目錄
3. **使用 MemoryRouter**：測試 React Router 相關元件時需包裹
4. **Fake Timers**：含 `setTimeout` 的互動邏輯需使用 `vi.useFakeTimers()` + `vi.advanceTimersByTime()`，測試結束記得 `vi.useRealTimers()`
5. **DOM 查詢**：優先使用 `screen.getByText` / `screen.getByRole`，必要時才用 `document.querySelectorAll`
