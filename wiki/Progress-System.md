# 🏆 積分與成就系統

> `src/contexts/ProfileContext.jsx` — 使用 localStorage 管理多學員進度

## 概述

積分系統負責記錄每次遊戲成果，包含星星累計、難度關卡進度、遊玩歷史、成就徽章等，所有資料儲存於瀏覽器的 `localStorage`，不傳送至任何伺服器。

## 學員資料結構

```javascript
{
  id: 'profile-1234567890',  // 時間戳 ID
  name: '小明',               // 學員名稱
  avatar: '🧒',              // emoji 頭像
  age: 4,                   // 年齡
  createdAt: '2026-02-28T...',
  levelProgress: {},         // 關卡進度（下說）
  unlockedGames: [...],      // 已解鎖遊戲 ID 清單
  totalStars: 0,
  gamesPlayed: 0,
  history: [],               // 遊玩紀錄（最多 200 筆）
  achievements: [],
  lastPlayed: null
}
```

### 關卡進度 (`levelProgress[gameId]`)

```javascript
{
  beginner: 3,           // 初級通達次數
  intermediate: 1,
  bestStars: {
    beginner: 3,         // 該難度最佳星星
    intermediate: 2,
  },
  intermediateUnlocked: true,
  advancedUnlocked: false
}
```

### 單筆遊戲紀錄

```javascript
{
  id: 1709123456789,          // 時間戳 ID
  gameId: 'balloon-pop',      // 遊戲識別碼
  gameName: '數字氣球',        // 遊戲名稱
  stars: 3,                   // 獲得星星數 (1~3)
  details: '初級 · 零失誤！',  // 附加描述
  level: 'beginner',          // 挑戰的難度
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
| `explorer` | 🗺️ | 探險家 | 嘗試所有遊戲 |
| `master` | 🏅 | 大師 | 所有遊戲高級過關 |

## API

### `useProfile()` Hook

```javascript
const {
  profiles,
  activeProfile,
  createProfile,
  switchProfile,
  deleteProfile,
  recordGame,
  getGameStats,
  resetProgress
} = useProfile()
```

| 方法 | 說明 |
|------|------|
| `activeProfile` | 當前學員物件 |
| `recordGame(gameId, gameName, stars, details, level)` | 記錄一次遊戲結果，自動檢查成就與解鎖 |
| `resetProgress()` | 清除所有進度（含 localStorage） |
| `getGameStats(gameId)` | 取得特定遊戲統計：`{ totalPlayed, bestStars, avgStars }` |

## 難度解鎖邏輯

每款遊戲都有 5 個難度：`beginner → intermediate → advanced → expert → master`

完成當前難度並獲得 **≥ 2 星**，`recordGame` 中會自動將 `${nextLevel}Unlocked` 設為 `true`。

## 遊戲解鎖邏輯

透過學習拓樸，完成前置遊戲並拿到 **≥ 1 星**即解鎖新遊戲：

| 目標遊戲 | 需要條件 |
|----------|----------|
| 動物翻翻樂 | 顏色配對初級 2 星 |
| 數字氣球 | 形狀排排看初級 2 星 |
| 數字學習 | 數字氣球初級 2 星 |
| ABC 英文字母 | 數字學習初級 2 星 + 動物翻翻樂初級 2 星 |
| 注音符號 | ABC 英文字母初級 2 星 |
| 簡易加減法 | 數字學習初級 2 星 |
| 簡易中文字 | 注音符號初級 2 星 |

## 儲存機制

- **學員清單鍵名**：`kids-playground-profiles`
- **當前學員鍵名**：`kids-playground-active-profile`
- 每次 state 變更時自動寫入 `localStorage`
- 初始化時從 `localStorage` 讀取，若讀取失敗則使用預設值
- 歷史紀錄上限 200 筆，超過自動移除最舊紀錄

## 在學習履歷頁面的呈現

`/history` 頁面 (`src/pages/History/History.jsx`) 提供：

- 📊 總覽統計（總星星數、遊戲次數、解鎖成就數）
- 🏅 成就徽章牆
- 📋 完整遊戲歷史列表（含日期、遊戲名稱、星星數、難度、詳情）
- 🗑️ 重設進度按鈕
