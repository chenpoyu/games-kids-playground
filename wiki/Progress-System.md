# 🏆 積分與成就系統

> `src/hooks/useProgress.js` — 使用 localStorage 管理學習進度

## 概述

積分系統負責記錄每次遊戲成果，包含星星累計、遊玩歷史、成就徽章等，所有資料儲存於瀏覽器的 `localStorage`，不傳送至任何伺服器。

## 資料結構

```javascript
{
  totalStars: 0,        // 星星總數
  gamesPlayed: 0,       // 遊戲總次數
  history: [],          // 遊玩紀錄（最多保留 100 筆）
  achievements: [],     // 已解鎖的成就 ID
  lastPlayed: null      // 最後遊玩時間 (ISO string)
}
```

### 單筆遊戲紀錄

```javascript
{
  id: 1709123456789,          // 時間戳 ID
  gameId: 'balloon-pop',      // 遊戲識別碼
  gameName: '數字氣球',        // 遊戲名稱
  stars: 3,                   // 獲得星星數 (1~3)
  details: '零失誤！',         // 附加描述
  date: '2026-02-28T...'      // ISO 日期
}
```

## 成就徽章

| ID | Emoji | 名稱 | 解鎖條件 |
|----|-------|------|----------|
| `first-game` | 🎉 | 初次冒險 | 完成第 1 個遊戲 |
| `ten-games` | 🔥 | 遊戲達人 | 累計完成 10 個遊戲 |
| `fifty-stars` | 🌟 | 星星收藏家 | 累積 50 顆星星 |
| `perfect-game` | 👑 | 完美通關 | 任一遊戲獲得 3 顆星 |
| `explorer` | 🗺️ | 探險家 | 嘗試所有 6 款遊戲 |

## API

### `useProgress()` Hook

```javascript
const { progress, recordGame, resetProgress, getGameStats } = useProgress()
```

| 方法 | 說明 |
|------|------|
| `progress` | 當前進度物件 |
| `recordGame(gameId, gameName, stars, details)` | 記錄一次遊戲結果，自動檢查成就 |
| `resetProgress()` | 清除所有進度（含 localStorage） |
| `getGameStats(gameId)` | 取得特定遊戲統計：`{ totalPlayed, bestStars, avgStars }` |

## 儲存機制

- **儲存鍵名**：`kids-playground-progress`
- 每次 `progress` state 變更時自動寫入 `localStorage`
- 初始化時從 `localStorage` 讀取，若讀取失敗則使用預設值
- 歷史紀錄上限 100 筆，超過自動移除最舊紀錄

## 在學習履歷頁面的呈現

`/history` 頁面 (`src/pages/History/History.jsx`) 提供：

- 📊 總覽統計（總星星數、遊戲次數、解鎖成就數）
- 🏅 成就徽章牆
- 📋 完整遊戲歷史列表（含日期、遊戲名稱、星星數、詳情）
- 🗑️ 重設進度按鈕
