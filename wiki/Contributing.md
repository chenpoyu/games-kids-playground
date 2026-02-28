# 🤝 貢獻指南

感謝你對「兒童遊戲樂園」的關注！歡迎提交 Issue 或 Pull Request。

## 開發流程

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/games-kids-playground.git
cd games-kids-playground
npm install
```

### 2. 建立分支

```bash
git checkout -b feature/my-new-game
```

### 3. 開發與測試

```bash
# 啟動開發伺服器
npm run dev

# 執行測試（監聽模式）
npm test

# 確認所有測試通過
npm run test:run
```

### 4. 提交

```bash
git add .
git commit -m "feat: 新增 XXX 遊戲"
git push origin feature/my-new-game
```

### 5. 發送 Pull Request

在 GitHub 上建立 PR，描述你的變更內容。

---

## 新增一款遊戲

### 步驟

1. 在 `src/games/` 下建立新資料夾（PascalCase），包含 `.jsx` 與 `.scss`
2. 在 `src/App.jsx` 中新增路由
3. 在 `src/pages/Home/Home.jsx` 中新增遊戲卡片
4. 在 `src/test/games/` 中新增對應測試
5. 在 `src/pages/About/About.jsx` 的 `GAME_LIST` 中新增遊戲資訊

### 遊戲元件範本

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import './MyGame.scss'

export default function MyGame() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playWin } = useSound()
  const { recordGame } = useProgress()
  const [showWin, setShowWin] = useState(false)
  const [errors, setErrors] = useState(0)

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 2) return 2
    return 1
  }

  const resetGame = () => {
    setShowWin(false)
    setErrors(0)
    // ...重設遊戲狀態
  }

  return (
    <div className="my-game">
      <BackButton />
      <h1>🎮 我的新遊戲</h1>
      {/* 遊戲內容 */}
      <WinModal
        show={showWin}
        stars={getStars()}
        message="恭喜完成！"
        onReplay={resetGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
```

---

## 命名慣例

| 項目 | 慣例 | 範例 |
|------|------|------|
| 元件資料夾 | PascalCase | `MyGame/` |
| 元件檔案 | PascalCase `.jsx` | `MyGame.jsx` |
| 樣式檔案 | PascalCase `.scss` | `MyGame.scss` |
| CSS 類名 | BEM：`block__element--modifier` | `.my-game__title--active` |
| Hook | camelCase `use` 前綴 | `useMyHook.js` |
| 測試檔案 | 同名 `.test.jsx` | `MyGame.test.jsx` |
| 路由路徑 | kebab-case | `/my-game` |
| 遊戲 ID | kebab-case | `my-game` |

## Commit Message 格式

建議使用 [Conventional Commits](https://www.conventionalcommits.org/)：

| 類型 | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增記憶翻牌遊戲` |
| `fix` | 修復 bug | `fix: 修正數字學習無限迴圈` |
| `test` | 測試 | `test: 補充 BalloonPop 測試` |
| `docs` | 文件 | `docs: 更新 README` |
| `style` | 樣式 | `style: 調整首頁卡片間距` |
| `refactor` | 重構 | `refactor: 抽取共用音效邏輯` |

## 設計原則

- 🎯 **以幼兒為中心**：操作直覺、正向回饋、不懲罰
- 🧩 **元件獨立性**：每款遊戲自成一個資料夾，互不干擾
- 🧪 **測試優先**：新增功能請同步補充測試
- 📱 **響應式**：確保手機、平板、桌機都能正常遊玩
- ♿ **無障礙**：按鈕要有語意化標記，避免僅靠顏色傳達資訊
