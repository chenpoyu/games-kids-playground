# 🛠️ 技術棧

## 核心框架

| 技術 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev/) | 19 | UI 框架 |
| [Vite](https://vite.dev/) | 7 | 建構工具 + 開發伺服器 |
| [React Router DOM](https://reactrouter.com/) | 7 | 客戶端路由 |

## 樣式

| 技術 | 說明 |
|------|------|
| [SCSS](https://sass-lang.com/) | CSS 預處理器 |
| BEM 命名法 | `.block__element--modifier` 結構化命名 |
| CSS 變數 | 透過 `_variables.scss` 統一管理色彩與間距 |
| RWD Mixins | 透過 `_mixins.scss` 提供響應式斷點 |

## 特效

| 技術 | 說明 |
|------|------|
| [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) | 過關撒花慶祝動畫 |
| Web Audio API | 原生音效合成（無外部音檔） |
| Web Speech API | 語音朗讀題目與說明 |
| CSS Animations | 翻牌、搖晃、浮動等互動動畫 |

## 狀態管理

| 技術 | 說明 |
|------|------|
| React Context (`ProfileContext`) | 全域多學員狀態管理、難度定義、遊戲解鎖邏輯 |
| localStorage | 儲存學習進度與成就（`kids-playground-profiles`、`kids-playground-active-profile`） |

## 測試

| 技術 | 說明 |
|------|------|
| [Vitest](https://vitest.dev/) | 測試框架（與 Vite 整合） |
| [React Testing Library](https://testing-library.com/react) | React 元件測試 |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | DOM 斷言擴充 |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | 程式碼覆蓋率（V8 provider） |

> 📌 覆蓋率報告輸出至 `coverage/`，已加入 `.gitignore` 不納入版本控制。

## CI/CD

| 技術 | 說明 |
|------|------|
| GitHub Actions | 自動化測試 + 建構 + 部署 |
| GitHub Pages | 靜態網站託管 |

## 開發工具

| 技術 | 說明 |
|------|------|
| [ESLint](https://eslint.org/) | 程式碼品質檢查 |
| Node.js 20 | 執行環境 |

## 設計決策

### 為什麼不用外部 UI 框架？
目標是輕量且快速，純 SCSS + 自訂元件能完全控制視覺風格，也適合學習目的。

### 為什麼音效不用音檔？
Web Audio API 直接合成音效，免除音檔載入時間、減少專案體積、避免授權問題。

### 為什麼加入 Web Speech API？
目標用戶為 2~6 歲幼兒，語音朗讀能幫助尚未識字的小朋友理解題目與說明，降低學習門檻。

### 為什麼用 React Context 取代 useProgress？
新版多學員系統需要跨元件共享學員資料、關卡進度與解鎖狀態，Context 比單純 Hook 更適合全域狀態管理。

### 為什麼用 localStorage 而非資料庫？
這是面向幼兒的前端應用，不需要帳號系統。localStorage 簡單、不蒐集個資、離線可用。
