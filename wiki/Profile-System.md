# 👤 學員與難度系統

> `src/contexts/ProfileContext.jsx` — 管理多學員、年齡分級與遊戲解鎖

## 概述

學員系統讓每位小朋友都能建立專屬的「學習護照」，各自擁有獨立的遊戲進度、星星數量與成就記錄。

## 學員功能

- **建立學員**：設定名稱、年齡（2~6 歲）、emoji 頭像
- **切換學員**：支援多位小朋友共用同一裝置
- **刪除學員**：移除學員及其所有進度
- **自動解鎖**：依年齡預設解鎖適齡遊戲

## 年齡分級

| 年齡 | 標籤 | 預設解鎖遊戲 |
|------|------|-------------|
| 2 歲 🌱 | 啟蒙探索 | 顏色配對、形狀排排看 |
| 3 歲 🌿 | 基礎學習 | + 動物翻翻樂、數字氣球、數字學習 |
| 4 歲 🌳 | 進階挑戰 | + ABC 字母、注音符號、加減法、中文字 |
| 5 歲 🌟 | 綜合運用 | 全部 9 款遊戲 |
| 6 歲 🏆 | 挑戰大師 | 全部 9 款遊戲 |

## 五級難度系統

每款遊戲都有 5 個難度，拿到 2 星以上即解鎖下一關：

| 難度 | Emoji | 顏色 | 說明 |
|------|-------|------|------|
| 初級 (beginner) | ⭐ | 青綠 | 基礎入門 |
| 中級 (intermediate) | ⭐⭐ | 藍色 | 進階挑戰 |
| 高級 (advanced) | ⭐⭐⭐ | 橙色 | 高手過招 |
| 專家 (expert) | 🌟 | 紫色 | 專家級別 |
| 大師 (master) | 👑 | 紅色 | 最終挑戰 |

## LevelSelect 元件

進入每款遊戲前，`LevelSelect` 元件會顯示難度選擇畫面：
- 顯示每個難度的鎖定/解鎖狀態
- 已完成的難度顯示最佳星星數與遊玩次數
- 未解鎖的難度顯示「{前一難度}拿到2星解鎖」提示

## 全域狀態

`ProfileContext` 透過 React Context 提供：

```javascript
const {
  profiles,           // 所有學員清單
  activeProfile,      // 當前學員物件
  activeProfileId,    // 當前學員 ID
  createProfile,      // 建立新學員
  switchProfile,      // 切換學員
  deleteProfile,      // 刪除學員
  updateProfile,      // 更新學員資料
  recordGame,         // 記錄遊戲結果
  getGameStats,       // 取得遊戲統計
  resetProgress,      // 重設進度
} = useProfile()
```

## 匯出常數

| 常數 | 說明 |
|------|------|
| `DIFFICULTY_LEVELS` | 五個難度的定義物件 |
| `LEVEL_ORDER` | 難度順序陣列 |
| `AGE_GROUPS` | 年齡分組定義 |
| `ACHIEVEMENTS` | 成就徽章定義 |
| `getNextLevel(level)` | 取得下一個難度名稱 |
