# 🎪 兒童遊戲樂園 Kids Games Playground

> 🌐 **線上體驗：** [https://chenpoyu.github.io/games-kids-playground/](https://chenpoyu.github.io/games-kids-playground/)

專為 **2~6 歲幼兒** 設計的互動學習遊戲網站，結合趣味遊戲與基礎學習內容，讓孩子在玩樂中成長！

## ✨ 特色功能

- 🎮 **6 款互動遊戲** — 涵蓋顏色、形狀、數字、英文字母等主題
- 🏆 **積分系統** — 星星評分與成就徽章，激勵學習動力
- 📊 **學習履歷** — 記錄遊戲歷程與學習成果
- 📱 **響應式設計 (RWD)** — 手機、平板、桌機都能流暢遊玩
- 🔊 **音效互動** — 正確/錯誤音效回饋，提升遊戲體驗
- 🎉 **勝利動畫** — 完成遊戲時的慶祝撒花動畫
- ✅ **單元測試** — 使用 Vitest + React Testing Library 確保程式碼品質

## 🎯 遊戲列表

### 趣味遊戲
| 遊戲 | 說明 | 適齡 |
|------|------|------|
| 🎨 顏色配對 | 翻牌記憶，找出相同顏色 | 2~4 歲 |
| 🦁 動物翻翻樂 | 記憶翻牌，配對相同動物 | 2~5 歲 |
| 🎈 數字氣球 | 按 1~7 順序戳破氣球 | 3~5 歲 |
| 🔷 形狀排排看 | 認識形狀並拖放到正確位置 | 3~6 歲 |

### 學習專區
| 遊戲 | 說明 | 適齡 |
|------|------|------|
| 🔢 數字學習 | 三關式數字認識與排序 (1~10) | 3~6 歲 |
| 🔤 ABC 英文字母 | 學習/配對/排序三種模式 (A~Z) | 4~6 歲 |

## 🛠️ 技術棧

- **React 19** + **Vite 7** — 快速開發與建構
- **React Router DOM 7** — 頁面路由
- **SCSS (BEM)** — 模組化樣式設計
- **Vitest** + **React Testing Library** — 單元測試
- **canvas-confetti** — 勝利慶祝動畫
- **Web Audio API** — 原生音效（無外部音檔依賴）
- **localStorage** — 本地端學習紀錄儲存
- **GitHub Actions** + **GitHub Pages** — CI/CD 自動部署

## 📁 專案結構

```
src/
├── components/          # 共用元件
│   ├── BackButton/      # 返回按鈕
│   ├── StarScore/       # 星星評分
│   └── WinModal/        # 勝利彈窗
├── games/               # 遊戲模組
│   ├── AnimalPuzzle/    # 動物翻翻樂
│   ├── BalloonPop/      # 數字氣球
│   ├── ColorMatch/      # 顏色配對
│   ├── ShapeSort/       # 形狀排排看
│   ├── NumberLearn/     # 數字學習
│   └── ABCLearn/        # ABC 英文字母
├── hooks/               # 自訂 Hooks
│   ├── useSound.js      # 音效系統
│   └── useProgress.js   # 積分/成就系統
├── pages/               # 頁面
│   ├── Home/            # 首頁
│   ├── History/         # 學習履歷
│   └── About/           # 網站介紹
├── test/                # 單元測試
│   ├── setup.js         # 測試環境設定
│   ├── App.test.jsx     # 路由測試
│   ├── components/      # 元件測試
│   └── hooks/           # Hook 測試
└── styles/              # 全域樣式
    ├── _variables.scss  # 色彩/字型變數
    ├── _mixins.scss     # 共用 mixins
    ├── _animations.scss # 動畫 keyframes
    └── global.scss      # 全域基礎樣式
```

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```

### 建構正式版本
```bash
npm run build
```

### 預覽正式版本
```bash
npm run preview
```

## 🧪 測試

### 執行測試（監聽模式）
```bash
npm test
```

### 單次執行所有測試
```bash
npm run test:run
```

### 執行測試並產生覆蓋率報告
```bash
npm run test:coverage
```

### 測試涵蓋範圍
- **元件測試** — StarScore、BackButton、WinModal
- **Hook 測試** — useProgress（積分/成就/localStorage）、useSound（音效）
- **路由測試** — 全部 9 條路由正確渲染

## 🚢 部署

本專案使用 **GitHub Actions** 自動部署至 **GitHub Pages**：

1. 推送程式碼至 `main` 分支
2. GitHub Actions 自動執行測試 → 建構 → 部署
3. 網站自動更新至 [https://chenpoyu.github.io/games-kids-playground/](https://chenpoyu.github.io/games-kids-playground/)

> ⚙️ 如需手動部署，可在 GitHub repo 的 Actions 頁面點擊 **Run workflow**

## 👨‍👩‍👧‍👦 給家長的話

- 所有遊戲皆為純前端，**無需網路連線**即可遊玩
- **不蒐集任何個人資料**，學習紀錄僅儲存於本地瀏覽器
- 遊戲設計以**正向鼓勵**為主，沒有懲罰機制
- 建議每次遊玩 **15~20 分鐘**，培養健康的數位使用習慣

## 📄 授權

MIT License

© 2026 Poyu.Chen
