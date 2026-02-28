# 🧩 共用元件

本專案有 3 個共用元件，位於 `src/components/`。

---

## ⬅️ BackButton

> `src/components/BackButton/BackButton.jsx`

返回首頁的按鈕，顯示於每個遊戲與子頁面的左上角。

### 使用方式

```jsx
import BackButton from '../../components/BackButton/BackButton'

// 在元件中直接使用
<BackButton />
```

### 行為
- 點擊後導航至首頁 `/`
- 顯示文字「回首頁」

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

### 使用方式

```jsx
<WinModal
  show={showWin}
  stars={getStars()}
  message="太棒了！零失誤完成！"
  onReplay={resetGame}
  onHome={() => navigate('/')}
/>
```

### 特效
- 彈窗出現時觸發 **canvas-confetti** 撒花動畫 🎊
- 顯示標題「恭喜過關！」
- 按鈕：「🔄 再玩一次」/「🏠 回首頁」
