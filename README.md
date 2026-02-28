# 🎪 兒童遊戲樂園 Kids Games Playground

> 🌐 **線上體驗：** [https://chenpoyu.github.io/games-kids-playground/](https://chenpoyu.github.io/games-kids-playground/)

專為 **2~6 歲幼兒** 設計的互動學習遊戲網站，結合趣味遊戲與基礎學習內容，讓孩子在玩樂中成長！

## ✨ 特色功能

- 🎮 **9 款互動遊戲** — 涵蓋顏色、形狀、數字、英文字母、注音符號、中文字、加減法等主題
- 👤 **多學員檔案** — 支援建立多個學習護照，各自記錄獨立進度
- 🗺️ **學習路徑地圖** — 依年齡分級、循序漸進解鎖新遊戲
- 🏆 **五級難度系統** — 初級→中級→高級→專家→大師，拿到 2 星即解鎖下一關
- 🎖️ **成就徽章** — 達成特定里程碑自動解鎖成就
- 📊 **學習履歷** — 記錄每次遊戲歷程與學習成果
- 📱 **響應式設計 (RWD)** — 手機、平板、桌機都能流暢遊玩
- 🔊 **音效互動** — Web Audio API 合成音效，正確/錯誤立即回饋
- 🗣️ **語音朗讀** — Web Speech API 自動朗讀題目與說明
- 🎉 **勝利動畫** — 完成遊戲時的慶祝撒花動畫
- ✅ **單元測試** — 使用 Vitest + React Testing Library 確保程式碼品質

## 🎯 遊戲列表

### 趣味遊戲
| 遊戲 | 路徑 | 說明 | 適齡 |
|------|------|------|------|
| 🎨 顏色配對 | `/color-match` | 翻牌記憶，找出相同顏色 | 2~4 歲 |
| 🦁 動物翻翻樂 | `/animal-puzzle` | 記憶翻牌，配對相同動物 | 2~5 歲 |
| 🎈 數字氣球 | `/balloon-pop` | 按順序戳破數字氣球 | 3~5 歲 |
| 🔷 形狀排排看 | `/shape-sort` | 認識形狀並拖放到正確位置 | 3~6 歲 |

### 學習專區
| 遊戲 | 路徑 | 說明 | 適齡 |
|------|------|------|------|
| 🔢 數字學習 | `/number-learn` | 認識/配對/排序三種模式 (1~10) | 3~6 歲 |
| 🔤 ABC 英文字母 | `/abc-learn` | 學習/配對/排序三種模式 (A~Z) | 4~6 歲 |
| ㄅ 注音符號 | `/zhuyin-learn` | 認識/配對/排序三種模式 (ㄅ~ㄩ) | 4~6 歲 |
| ➕ 簡易加減法 | `/math-basic` | 5 以內加法到 50 以內加減法 | 4~6 歲 |
| 漢 簡易中文字 | `/chinese-char` | 象形文字認識與詞義配對 | 4~6 歲 |

## 👤 學員系統

每位小朋友可建立專屬的「學習護照」，功能包含：

- **個人頭像與名稱** — 用 emoji 自訂個性頭像
- **年齡分級** — 依年齡 (2~6 歲) 自動推薦合適遊戲
- **獨立進度** — 每位學員的解鎖狀態、星星數、履歷完全分開
- **關卡進度** — 每款遊戲追蹤各難度的最佳星星與通關次數
- **遊戲解鎖** — 透過學習拓樸（完成前置遊戲並拿到 2 星）解鎖新遊戲

## 🗺️ 學習路徑解鎖邏輯

```
顏色配對 ──→ 動物翻翻樂
形狀排排看 ──→ 數字氣球 ──→ 數字學習 ──┬──→ ABC 英文字母 ──→ 注音符號 ──→ 簡易中文字
                                        └──→ 簡易加減法
```

## 🛠️ 技術棧

- **React 19** + **Vite 7** — 快速開發與建構
- **React Router DOM 7** — 客戶端頁面路由
- **SCSS (BEM)** — 模組化樣式設計
- **Vitest** + **React Testing Library** — 單元測試與覆蓋率
- **canvas-confetti** — 勝利慶祝撒花動畫
- **Web Audio API** — 原生音效合成（無外部音檔依賴）
- **Web Speech API** — 語音朗讀功能
- **localStorage** — 本地端多學員學習紀錄儲存
- **GitHub Actions** + **GitHub Pages** — CI/CD 自動部署

## 📁 專案結構

```
src/
├── App.jsx                  # 路由配置、ProfileProvider 包覆
├── main.jsx                 # 應用程式入口
├── contexts/
│   └── ProfileContext.jsx   # 多學員狀態管理、難度定義、解鎖邏輯
├── components/              # 共用元件
│   ├── BackButton/          # 返回首頁按鈕
│   ├── LevelSelect/         # 五級難度選擇介面
│   ├── ProfileBar/          # 頂部學員資訊列
│   ├── ProfileSelect/       # 學員選擇 / 新增畫面
│   ├── StarScore/           # 星星評分顯示
│   └── WinModal/            # 勝利過關彈窗
├── games/                   # 遊戲模組
│   ├── ABCLearn/            # 🔤 ABC 英文字母
│   ├── AnimalPuzzle/        # 🦁 動物翻翻樂
│   ├── BalloonPop/          # 🎈 數字氣球
│   ├── ChineseChar/         # 漢 簡易中文字
│   ├── ColorMatch/          # 🎨 顏色配對
│   ├── MathBasic/           # ➕ 簡易加減法
│   ├── NumberLearn/         # 🔢 數字學習
│   ├── ShapeSort/           # 🔷 形狀排排看
│   └── ZhuyinLearn/         # ㄅ 注音符號
├── hooks/                   # 自訂 React Hooks
│   ├── useSound.js          # Web Audio API 音效
│   ├── useSpeak.js          # Web Speech API 語音朗讀
│   └── useProgress.js       # (舊版) 積分/成就系統
├── pages/                   # 頁面
│   ├── Home/                # 首頁遊戲選單
│   ├── LearningMap/         # 學習路徑地圖
│   ├── History/             # 學習履歷
│   └── About/               # 關於本站
├── test/                    # 單元測試（目錄結構映射 src/）
│   ├── setup.js             # 測試環境設定
│   ├── App.test.jsx
│   ├── components/
│   ├── games/
│   ├── hooks/
│   └── pages/
└── styles/                  # 全域 SCSS
    ├── _variables.scss      # 色彩/字型/間距變數
    ├── _mixins.scss         # RWD / 共用 mixins
    ├── _animations.scss     # 動畫 keyframes
    └── global.scss          # 全域基礎樣式
```

## 🗂️ 路由結構

| 路徑 | 說明 |
|------|------|
| `/` | 首頁遊戲選單 |
| `/learning-map` | 學習路徑地圖 |
| `/color-match` | 🎨 顏色配對 |
| `/animal-puzzle` | 🦁 動物翻翻樂 |
| `/balloon-pop` | 🎈 數字氣球 |
| `/shape-sort` | 🔷 形狀排排看 |
| `/number-learn` | 🔢 數字學習 |
| `/abc-learn` | 🔤 ABC 英文字母 |
| `/zhuyin-learn` | ㄅ 注音符號 |
| `/math-basic` | ➕ 簡易加減法 |
| `/chinese-char` | 漢 簡易中文字 |
| `/history` | 📊 學習履歷 |
| `/about` | ℹ️ 關於本站 |

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

> 📁 覆蓋率報告輸出至 `coverage/` 資料夾（已加入 `.gitignore`，不上傳至版本庫）

### 測試涵蓋範圍
- **元件測試** — StarScore、BackButton、WinModal
- **Hook 測試** — useProgress（積分/成就/localStorage）、useSound（音效）
- **遊戲測試** — 6 款遊戲核心邏輯
- **頁面測試** — Home、History、About
- **路由測試** — 全部路由正確渲染

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
- 語音朗讀功能需開啟瀏覽器的語音合成支援（Chrome / Edge 支援最佳）

## 📄 授權

MIT License

© 2026 Poyu.Chen
