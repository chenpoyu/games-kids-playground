# 📁 專案結構

```
games-kids-playground/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
├── public/                      # 靜態資源
├── src/
│   ├── App.jsx                  # 路由配置
│   ├── main.jsx                 # 應用程式入口
│   ├── assets/                  # 靜態素材
│   ├── components/              # 共用元件
│   │   ├── BackButton/          # 返回首頁按鈕
│   │   ├── StarScore/           # 星星評分顯示
│   │   └── WinModal/            # 勝利過關彈窗
│   ├── games/                   # 遊戲模組（每個遊戲一個資料夾）
│   │   ├── ABCLearn/            # ABC 英文字母
│   │   ├── AnimalPuzzle/        # 動物翻翻樂
│   │   ├── BalloonPop/          # 數字氣球
│   │   ├── ColorMatch/          # 顏色配對
│   │   ├── NumberLearn/         # 數字學習
│   │   └── ShapeSort/           # 形狀排排看
│   ├── hooks/                   # 自訂 React Hooks
│   │   ├── useProgress.js       # 積分 / 成就 / 學習履歷
│   │   └── useSound.js          # Web Audio API 音效
│   ├── pages/                   # 頁面
│   │   ├── About/               # 關於本站
│   │   ├── History/             # 學習履歷
│   │   └── Home/                # 首頁遊戲列表
│   ├── styles/                  # 全域 SCSS
│   │   ├── _animations.scss     # 動畫 keyframes
│   │   ├── _mixins.scss         # RWD / 共用 mixins
│   │   ├── _variables.scss      # 色彩 / 字型 / 間距變數
│   │   └── global.scss          # 全域基礎樣式
│   └── test/                    # 測試檔案（目錄結構映射 src/）
│       ├── setup.js             # 測試環境設定
│       ├── App.test.jsx
│       ├── components/
│       ├── games/
│       ├── hooks/
│       └── pages/
├── index.html                   # HTML 入口
├── vite.config.js               # Vite + Vitest 設定
├── eslint.config.js             # ESLint 設定
└── package.json
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 元件 | PascalCase 資料夾 + 同名 `.jsx` + `.scss` | `BackButton/BackButton.jsx` |
| Hook | camelCase `use` 前綴 | `useProgress.js` |
| 樣式 | BEM 命名 | `.balloon-pop__header` |
| 測試 | 同名 `.test.jsx` / `.test.js` | `BalloonPop.test.jsx` |

## 路由結構

| 路徑 | 元件 | 說明 |
|------|------|------|
| `/` | `Home` | 首頁遊戲選單 |
| `/color-match` | `ColorMatch` | 顏色配對 |
| `/animal-puzzle` | `AnimalPuzzle` | 動物翻翻樂 |
| `/balloon-pop` | `BalloonPop` | 數字氣球 |
| `/shape-sort` | `ShapeSort` | 形狀排排看 |
| `/number-learn` | `NumberLearn` | 數字學習 |
| `/abc-learn` | `ABCLearn` | ABC 英文字母 |
| `/history` | `History` | 學習履歷 |
| `/about` | `About` | 關於本站 |
