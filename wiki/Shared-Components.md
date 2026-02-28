# 🧩 共用元件

本專案有 6 個共用元件，位於 `src/components/`。

---

## ⬅️ BackButton

> `src/components/BackButton/BackButton.jsx`

返回首頁的按鈕，顯示於每個遊戲與子頁面的左上角。

### 使用方式

```jsx
import BackButton from '../../components/BackButton/BackButton'

<BackButton />
```

### 行為
- 點擊後導航至首頁 `/`
- 顯示文字「回首頁」

---

## 🎯 LevelSelect

> `src/components/LevelSelect/LevelSelect.jsx`

五級難度選擇介面，顯示於每款遊戲進入時。

### Props

| Prop | 類型 | 說明 |
|------|------|------|
| `gameId` | `string` | 遊戲識別碼（用於讀取進度） |
| `gameName` | `string` | 遊戲名稱 |
| `gameEmoji` | `string` | 遊戲 emoji 圖示 |
| `onSelectLevel` | `function` | 選擇難度後的回呼 |
| `onBack` | `function` | 返回按鈕的回呼 |

### 功能
- 顯示五個難度按鈕：初級、中級、高級、專家、大師
- 已完成過的難度顯示最佳星星數與遊玩次數
- 未解鎖的難度顯示鎖定狀態與解鎖提示

---

## 👤 ProfileBar

> `src/components/ProfileBar/ProfileBar.jsx`

顯示於頂部的學員資訊列，包含頭像、名稱、總星星數。

---

## 🧑‍🎓 ProfileSelect

> `src/components/ProfileSelect/ProfileSelect.jsx`

學員選擇 / 新增畫面，在尚未選擇學員時自動顯示。

### 功能
- 顯示現有學員清單
- 新增學員（設定名稱、年齡、emoji 頭像）
- 刪除學員

---

## ⭐ StarScore

> `src/components/StarScore/StarScore.jsx`

星星評分顯示元件，以 emoji 星星呈現 1~3 顆星的成績。

### Props

| Prop | 類型 | 說明 |
|------|------|------|
| `stars` | `number` | 星星數量（1~3） |

### 使用方式

```jsx
<StarScore stars={3} />  // ⭐⭐⭐
<StarScore stars={2} />  // ⭐⭐
<StarScore stars={1} />  // ⭐
```

---

## 🎉 WinModal

> `src/components/WinModal/WinModal.jsx`

勝利過關彈窗，包含星星評分、過關訊息、重玩與回首頁按鈕，以及 `canvas-confetti` 撒花動畫。

### Props

| Prop | 類型 | 說明 |
|------|------|------|
| `show` | `boolean` | 是否顯示彈窗 |
| `stars` | `number` | 星星數量（1~3） |
| `message` | `string` | 過關訊息文字 |
| `onReplay` | `function` | 點擊「再玩一次」的回呼 |
| `onHome` | `function` | 點擊「回首頁」的回呼 |
| `onNextLevel` | `function?` | 點擊「挑戰下一關」的回呼（選填） |
| `nextLevelLabel` | `string?` | 下一關按鈕文字（選填） |

### 使用方式

```jsx
<WinModal
  show={showWin}
  stars={getStars()}
  message="太棒了！零失誤完成！"
  onReplay={resetGame}
  onHome={() => navigate('/')}
  onNextLevel={nextDifficultyUnlocked ? handleNextDifficulty : undefined}
  nextLevelLabel="挑戰中級"
/>
```

### 特效
- 彈窗出現時觸發 **canvas-confetti** 撒花動畫 🎊
- 顯示標題「恭喜過關！」
- 按鈕：「🔄 再玩一次」/「🏠 回首頁」/ 可選的「下一關 →」
