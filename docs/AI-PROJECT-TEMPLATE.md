# 🤖 AI 專案開發指南 - 兒童教育遊戲平台架構範本

> **文件目的：** 本文件提供完整的專案架構、設計模式和開發規範，讓 AI 可以理解並複製類似的互動式學習平台。

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [核心架構](#核心架構)
3. [技術棧](#技術棧)
4. [資料結構設計](#資料結構設計)
5. [核心功能模組](#核心功能模組)
6. [遊戲開發模式](#遊戲開發模式)
7. [UI/UX 設計原則](#uiux-設計原則)
8. [樣式系統](#樣式系統)
9. [測試策略](#測試策略)
10. [部署流程](#部署流程)
11. [開發建議](#開發建議)

---

## 專案概述

### 專案類型
單頁應用 (SPA) - 互動式教育學習平台

### 目標受眾
2~6 歲幼兒（需考慮認知能力、注意力持續時間、觸控操作）

### 核心價值
- ✅ **無需後端**：純前端實現，使用 localStorage 儲存資料
- ✅ **離線可用**：靜態資源，無需網路連線
- ✅ **隱私優先**：不收集個人資料，資料僅存本地
- ✅ **多用戶支援**：獨立學習檔案系統
- ✅ **進度追蹤**：關卡解鎖、成就系統、學習履歷
- ✅ **響應式設計**：支援手機/平板/桌面裝置

---

## 核心架構

### 1. 檔案結構

```
src/
├── App.jsx                      # 路由配置、Provider 包覆
├── main.jsx                     # 應用入口
│
├── contexts/                    # 全域狀態管理
│   └── ProfileContext.jsx       # 用戶檔案、進度管理、解鎖邏輯
│
├── components/                  # 共用元件
│   ├── BackButton/              # 返回按鈕
│   ├── LevelSelect/             # 難度選擇介面
│   ├── ProfileBar/              # 用戶資訊列
│   ├── ProfileSelect/           # 用戶選擇/新增介面
│   ├── StarScore/               # 星星評分顯示
│   └── WinModal/                # 勝利過關彈窗
│
├── games/                       # 遊戲模組（每個遊戲獨立資料夾）
│   ├── GameName/
│   │   ├── GameName.jsx         # 遊戲邏輯
│   │   └── GameName.scss        # 遊戲樣式
│
├── pages/                       # 頁面
│   ├── Home/                    # 首頁（遊戲選單）
│   ├── LearningMap/             # 學習路徑地圖
│   ├── History/                 # 學習履歷
│   └── About/                   # 關於頁面
│
├── hooks/                       # 自訂 React Hooks
│   ├── useSound.js              # Web Audio API 音效系統
│   ├── useSpeak.js              # Web Speech API 語音系統
│   └── useProgress.js           # 進度管理（可選）
│
├── styles/                      # 全域樣式
│   ├── _variables.scss          # SCSS 變數（顏色/字型/間距）
│   ├── _mixins.scss             # 共用 mixins（RWD/按鈕/布局）
│   ├── _animations.scss         # 動畫 keyframes
│   └── global.scss              # 全域基礎樣式
│
└── test/                        # 單元測試（映射 src/ 結構）
    ├── setup.js                 # 測試環境設定
    └── ...
```

### 2. 路由架構

```jsx
// App.jsx 核心結構
import { Routes, Route } from 'react-router-dom'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'

function AppContent() {
  const { activeProfile } = useProfile()
  
  // 未選擇用戶時，顯示用戶選擇介面
  if (!activeProfile) {
    return <ProfileSelect />
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning-map" element={<LearningMap />} />
      <Route path="/game-1" element={<Game1 />} />
      <Route path="/game-2" element={<Game2 />} />
      {/* ... 其他遊戲路由 */}
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  )
}
```

---

## 技術棧

### 核心框架
```json
{
  "react": "^19.2.0",              // UI 框架
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.1",   // 客戶端路由
  "vite": "^7.3.1"                 // 建構工具
}
```

### 樣式
```json
{
  "sass": "^1.97.3"                // SCSS 預處理器
}
```

### 特效
```json
{
  "canvas-confetti": "^1.9.4"      // 勝利動畫（撒花特效）
}
```

### 測試
```json
{
  "vitest": "^4.0.18",             // 測試框架
  "@testing-library/react": "^16.3.2",
  "@testing-library/jest-dom": "^6.9.1",
  "@vitest/coverage-v8": "^4.0.18"
}
```

### Web API（無需套件）
- **Web Audio API** - 音效合成
- **Web Speech API** - 語音朗讀
- **localStorage** - 本地資料儲存

---

## 資料結構設計

### 1. 用戶檔案結構

```javascript
const profile = {
  id: 'profile-1234567890',
  name: '小明',
  avatar: '🧒',
  age: 4,
  createdAt: '2024-01-01T00:00:00.000Z',
  
  // 關卡進度
  levelProgress: {
    'game-id': {
      beginner: 3,           // 初級玩過 3 次
      intermediate: 1,       // 中級玩過 1 次
      advanced: 0,
      expert: 0,
      master: 0,
      bestStars: {           // 各難度最佳星數
        beginner: 3,
        intermediate: 2,
        advanced: 0
      },
      intermediateUnlocked: true,  // 中級已解鎖
      advancedUnlocked: false      // 高級未解鎖
    }
  },
  
  // 遊戲解鎖狀態（學習路徑）
  unlockedGames: ['game-1', 'game-2'],
  
  // 統計資料
  totalStars: 45,
  gamesPlayed: 20,
  lastPlayed: '2024-01-15T10:30:00.000Z',
  
  // 學習履歷
  history: [
    {
      id: 1234567890,
      gameId: 'game-1',
      gameName: '遊戲名稱',
      stars: 3,
      details: '得分：100',
      level: 'beginner',
      date: '2024-01-15T10:30:00.000Z'
    }
  ],
  
  // 成就徽章（可選）
  achievements: [
    {
      id: 'first-win',
      name: '首次過關',
      unlockedAt: '2024-01-01T10:00:00.000Z'
    }
  ]
}
```

### 2. 難度等級定義

```javascript
const DIFFICULTY_LEVELS = {
  beginner: {
    label: '初級',
    emoji: '🌱',
    color: '#34D399',
    description: '輕鬆入門',
    config: { timeLimit: 60, items: 4, mistakes: 5 }
  },
  intermediate: {
    label: '中級',
    emoji: '🌟',
    color: '#60A5FA',
    description: '稍有挑戰',
    config: { timeLimit: 45, items: 6, mistakes: 4 }
  },
  advanced: {
    label: '高級',
    emoji: '🔥',
    color: '#F59E0B',
    description: '進階挑戰',
    config: { timeLimit: 30, items: 8, mistakes: 3 }
  },
  expert: {
    label: '專家',
    emoji: '💎',
    color: '#8B5CF6',
    description: '高手過招',
    config: { timeLimit: 25, items: 10, mistakes: 2 }
  },
  master: {
    label: '大師',
    emoji: '👑',
    color: '#EF4444',
    description: '終極挑戰',
    config: { timeLimit: 20, items: 12, mistakes: 1 }
  }
}

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert', 'master']
```

### 3. 遊戲解鎖規則（學習拓樸）

```javascript
const UNLOCK_RULES = [
  {
    gameId: 'game-2',
    requires: [
      { gameId: 'game-1', level: 'beginner', minStars: 2 }
    ]
  },
  {
    gameId: 'game-3',
    requires: [
      { gameId: 'game-1', level: 'beginner', minStars: 2 },
      { gameId: 'game-2', level: 'beginner', minStars: 2 }
    ]
  }
]
```

### 4. 遊戲配置資料

```javascript
const GAME_CONFIG = {
  id: 'game-id',
  name: '遊戲名稱',
  emoji: '🎮',
  description: '遊戲說明',
  ageRange: [3, 6],              // 適合年齡
  category: 'learning',           // 分類：learning / fun
  color: '#FF6B6B',
  path: '/game-path',
  prerequisites: ['game-1'],      // 前置遊戲
  skills: ['數字', '邏輯']        // 訓練技能
}
```

---

## 核心功能模組

### 1. ProfileContext (用戶狀態管理)

**職責：**
- 管理所有用戶檔案
- 處理關卡進度記錄
- 實現遊戲解鎖邏輯
- 同步 localStorage

**關鍵方法：**

```javascript
const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(null)
  
  // 建立新用戶
  const createProfile = (name, avatar, age) => { /* ... */ }
  
  // 切換用戶
  const switchProfile = (id) => { /* ... */ }
  
  // 刪除用戶
  const deleteProfile = (id) => { /* ... */ }
  
  // 記錄遊戲結果（含難度級別）
  const recordGame = (gameId, gameName, stars, details, level) => {
    // 1. 新增履歷記錄
    // 2. 更新關卡進度
    // 3. 檢查難度解鎖（拿到 2 星解鎖下一級）
    // 4. 檢查遊戲解鎖（根據 UNLOCK_RULES）
    // 5. 同步 localStorage
  }
  
  // 檢查遊戲是否解鎖
  const isGameUnlocked = (gameId) => { /* ... */ }
  
  // 檢查難度是否解鎖
  const isLevelUnlocked = (gameId, level) => { /* ... */ }
  
  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      createProfile,
      switchProfile,
      deleteProfile,
      recordGame,
      isGameUnlocked,
      isLevelUnlocked
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
```

### 2. useSound Hook (音效系統)

**使用 Web Audio API 合成音效，無需音檔**

```javascript
export function useSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  
  // 播放指定頻率的音效
  const playTone = (frequency, duration, type, volume) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type  // 'sine' | 'square' | 'triangle' | 'sawtooth'
    osc.frequency.value = frequency
    gain.gain.value = volume
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  }
  
  // 正確音效（三個音符上升）
  const playCorrect = () => {
    playTone(523, 0.1)  // C5
    setTimeout(() => playTone(659, 0.1), 100)  // E5
    setTimeout(() => playTone(784, 0.2), 200)  // G5
  }
  
  // 錯誤音效（低頻震動）
  const playWrong = () => {
    playTone(200, 0.3, 'square', 0.15)
  }
  
  // 點擊音效
  const playClick = () => {
    playTone(440, 0.08)
  }
  
  // 勝利音效（音階上升）
  const playWin = () => {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047]
    notes.forEach((note, i) => {
      setTimeout(() => playTone(note, 0.15), i * 100)
    })
  }
  
  return { playCorrect, playWrong, playClick, playWin }
}
```

### 3. useSpeak Hook (語音系統)

**使用 Web Speech API 朗讀文字**

```javascript
export function useSpeak() {
  // 播放語音
  const speak = (text, lang = 'zh-TW') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.8   // 語速
    utterance.pitch = 1.1  // 音調
    window.speechSynthesis.speak(utterance)
  }
  
  const speakZh = (text) => speak(text, 'zh-TW')
  const speakEn = (text) => speak(text, 'en-US')
  
  // 延遲播放（用於進入關卡時的語音說明）
  const speakDelayed = (text, lang = 'zh-TW', delay = 500) => {
    setTimeout(() => speak(text, lang), delay)
  }
  
  const stopSpeak = () => {
    window.speechSynthesis?.cancel()
  }
  
  return { speak, speakZh, speakEn, speakDelayed, stopSpeak }
}
```

---

## 遊戲開發模式

### 標準遊戲元件結構

每個遊戲都是獨立的 React 元件，遵循以下模式：

```jsx
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './GameName.scss'

// 遊戲配置（根據難度調整）
const LEVEL_CONFIG = {
  beginner: {
    label: '初級',
    timeLimit: 60,
    items: 4,
    maxMistakes: 5
  },
  intermediate: {
    label: '中級',
    timeLimit: 45,
    items: 6,
    maxMistakes: 4
  },
  advanced: {
    label: '高級',
    timeLimit: 30,
    items: 8,
    maxMistakes: 3
  },
  expert: {
    label: '專家',
    timeLimit: 25,
    items: 10,
    maxMistakes: 2
  },
  master: {
    label: '大師',
    timeLimit: 20,
    items: 12,
    maxMistakes: 1
  }
}

export default function GameName() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakDelayed } = useSpeak()
  const { recordGame, activeProfile } = useProfile()
  
  // 狀態管理
  const [difficulty, setDifficulty] = useState(null)  // 未選難度時顯示選擇介面
  const [gameData, setGameData] = useState(null)       // 遊戲資料
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showWin, setShowWin] = useState(false)
  
  // 根據難度載入配置
  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  
  // 初始化遊戲
  const initGame = useCallback(() => {
    if (!config) return
    // 根據 config 產生遊戲資料
    setGameData(generateGameData(config))
    setScore(0)
    setErrors(0)
    setTimeLeft(config.timeLimit)
    setIsPlaying(true)
    speakDelayed('遊戲開始！')
  }, [config, speakDelayed])
  
  // 選擇難度後初始化
  useEffect(() => {
    if (difficulty) {
      initGame()
    }
  }, [difficulty, initGame])
  
  // 倒數計時
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])
  
  // 檢查遊戲結束
  useEffect(() => {
    if (timeLeft <= 0 || errors >= config?.maxMistakes) {
      handleGameOver()
    }
  }, [timeLeft, errors, config])
  
  // 處理玩家操作
  const handlePlayerAction = (action) => {
    if (!isPlaying) return
    
    if (isCorrectAction(action)) {
      playCorrect()
      speakZh('答對了！')
      setScore(s => s + 10)
      // 更新遊戲狀態...
      checkWinCondition()
    } else {
      playWrong()
      speakZh('再試試看')
      setErrors(e => e + 1)
    }
  }
  
  // 檢查過關條件
  const checkWinCondition = () => {
    if (/* 達成條件 */) {
      handleWin()
    }
  }
  
  // 過關處理
  const handleWin = () => {
    setIsPlaying(false)
    playWin()
    
    // 計算星數（3 星制）
    const stars = calculateStars(score, errors, timeLeft)
    
    // 記錄遊戲結果
    recordGame(
      'game-id',
      '遊戲名稱',
      stars,
      `得分：${score}`,
      difficulty
    )
    
    setShowWin(true)
  }
  
  // 遊戲失敗
  const handleGameOver = () => {
    setIsPlaying(false)
    speakZh('時間到！')
    // 顯示失敗訊息...
  }
  
  // 計算星數邏輯
  const calculateStars = (score, errors, timeLeft) => {
    if (errors === 0 && timeLeft > 30) return 3
    if (errors <= 2 && timeLeft > 10) return 2
    return 1
  }
  
  // 未選擇難度時，顯示難度選擇介面
  if (!difficulty) {
    return (
      <LevelSelect
        gameId="game-id"
        gameName="遊戲名稱"
        gameEmoji="🎮"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }
  
  return (
    <div className="game-container">
      <BackButton />
      
      {/* 遊戲 UI */}
      <div className="game-header">
        <div className="game-info">
          <span>得分: {score}</span>
          <span>錯誤: {errors}/{config.maxMistakes}</span>
          <span>時間: {timeLeft}秒</span>
        </div>
      </div>
      
      <div className="game-content">
        {/* 遊戲主要內容 */}
      </div>
      
      {/* 勝利彈窗 */}
      <WinModal
        show={showWin}
        stars={calculateStars(score, errors, timeLeft)}
        message="你好棒！"
        onReplay={initGame}
        onHome={() => navigate('/')}
        onNextLevel={/* 下一難度邏輯 */}
        nextLevelLabel="下一關"
      />
    </div>
  )
}
```

### 遊戲開發檢查清單

- [ ] 實作五個難度等級 (beginner → master)
- [ ] 整合音效系統 (useSound)
- [ ] 整合語音系統 (useSpeak)
- [ ] 實作難度選擇介面 (LevelSelect)
- [ ] 實作勝利彈窗 (WinModal)
- [ ] 記錄遊戲結果到 ProfileContext
- [ ] 實作三星評分邏輯
- [ ] 新增 BackButton 返回首頁
- [ ] 響應式設計 (手機/平板/桌面)
- [ ] 建立 SCSS 模組化樣式
- [ ] 撰寫單元測試

---

## UI/UX 設計原則

### 1. 兒童友善設計

**視覺設計：**
- ✅ 使用明亮、飽和的顏色（吸引注意力）
- ✅ 大型、易觸控的按鈕（≥ 60px × 60px）
- ✅ Emoji 圖示（直覺理解、跨語言）
- ✅ 圓角設計（溫和、友善）
- ✅ 大字體（18px 以上）
- ✅ 高對比度（清晰易讀）

**互動設計：**
- ✅ 簡單的點擊/觸控操作
- ✅ 即時視覺/聽覺回饋
- ✅ 錯誤不懲罰（正向鼓勵）
- ✅ 動畫提示（引導注意力）
- ✅ 拖放操作（適合幼兒）

**遊戲節奏：**
- ✅ 單局遊戲時間 5~10 分鐘
- ✅ 即時反饋（不等待）
- ✅ 成就感設計（星星、獎盃）
- ✅ 難度漸進（避免挫折）

### 2. 共用元件設計

#### BackButton（返回按鈕）
```jsx
export default function BackButton({ to = '/', label = '返回' }) {
  const navigate = useNavigate()
  const { playClick } = useSound()
  
  return (
    <button 
      className="back-button"
      onClick={() => {
        playClick()
        navigate(to)
      }}
    >
      ← {label}
    </button>
  )
}
```

#### StarScore（星星評分）
```jsx
export default function StarScore({ stars = 0, max = 3 }) {
  return (
    <div className="star-score">
      {[...Array(max)].map((_, i) => (
        <span key={i} className={`star ${i < stars ? 'active' : ''}`}>
          {i < stars ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}
```

#### WinModal（勝利彈窗）
```jsx
export default function WinModal({ 
  show, 
  stars, 
  message, 
  onReplay, 
  onHome, 
  onNextLevel,
  nextLevelLabel 
}) {
  // 顯示時觸發 confetti 撒花動畫
  useEffect(() => {
    if (show) {
      confetti({ /* 配置 */ })
    }
  }, [show])
  
  return (
    <div className="win-modal">
      <div className="trophy">🏆</div>
      <h2>恭喜過關！</h2>
      <StarScore stars={stars} />
      <p>{message}</p>
      <div className="actions">
        {onNextLevel && <button onClick={onNextLevel}>{nextLevelLabel}</button>}
        <button onClick={onReplay}>再玩一次</button>
        <button onClick={onHome}>回首頁</button>
      </div>
    </div>
  )
}
```

#### LevelSelect（難度選擇）
```jsx
export default function LevelSelect({ 
  gameId, 
  gameName, 
  gameEmoji, 
  onSelectLevel, 
  onBack 
}) {
  const { activeProfile } = useProfile()
  const levelProgress = activeProfile?.levelProgress?.[gameId] || {}
  
  const isUnlocked = (level) => {
    if (level === 'beginner') return true
    return levelProgress[`${level}Unlocked`]
  }
  
  const getBestStars = (level) => {
    return levelProgress.bestStars?.[level] || 0
  }
  
  return (
    <div className="level-select">
      <h1>{gameEmoji} {gameName}</h1>
      <div className="levels">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
          <button
            key={key}
            disabled={!isUnlocked(key)}
            onClick={() => onSelectLevel(key)}
          >
            <div className="icon">{level.emoji}</div>
            <div className="label">{level.label}</div>
            <StarScore stars={getBestStars(key)} />
            {!isUnlocked(key) && <div className="lock">🔒</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 樣式系統

### 1. SCSS 變數設計

```scss
// _variables.scss

// === 主色調 ===
$color-primary: #FF6B6B;      // 珊瑚紅
$color-secondary: #4ECDC4;    // 薄荷綠
$color-accent: #FFE66D;       // 陽光黃
$color-purple: #A78BFA;       // 薰衣草紫
$color-blue: #60A5FA;         // 天空藍
$color-pink: #F472B6;         // 櫻花粉
$color-orange: #FB923C;       // 活力橙
$color-green: #34D399;        // 草地綠

// === 背景漸層 ===
$bg-gradient-sky: linear-gradient(180deg, #87CEEB 0%, #E0F7FA 50%, #FFF8E1 100%);
$bg-gradient-candy: linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #60A5FA 100%);

// === 文字色 ===
$text-dark: #2D3436;
$text-light: #636E72;
$text-white: #FFFFFF;

// === 字體 ===
$font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;

// === 圓角 ===
$radius-sm: 12px;
$radius-md: 20px;
$radius-lg: 30px;
$radius-xl: 40px;

// === 陰影 ===
$shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
$shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);

// === 動畫 ===
$transition-fast: 0.2s ease;
$transition-normal: 0.3s ease;
$transition-bounce: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

// === 間距 ===
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;
```

### 2. Mixins（共用樣式）

```scss
// _mixins.scss
@use 'variables' as *;

// 彈性置中
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-column-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

// 按鈕基礎樣式
@mixin btn-base {
  border: none;
  cursor: pointer;
  font-family: $font-family;
  font-weight: 700;
  border-radius: $radius-lg;
  transition: all $transition-bounce;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  
  &:active {
    transform: scale(0.92);
  }
}

// 主要按鈕樣式
@mixin btn-primary($bg: $color-primary, $color: $text-white) {
  @include btn-base;
  background: $bg;
  color: $color;
  padding: 14px 32px;
  font-size: 1.2rem;
  box-shadow: 0 4px 15px rgba($bg, 0.4);
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px rgba($bg, 0.5);
  }
  
  &:active {
    transform: translateY(0) scale(0.95);
  }
}

// 響應式斷點
@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 769px) and (max-width: 1024px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1025px) {
    @content;
  }
}

// 卡片樣式
@mixin card {
  background: white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;
  transition: all $transition-normal;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: $shadow-lg;
  }
}

// 遊戲容器
@mixin game-container {
  min-height: 100vh;
  padding: $spacing-lg;
  background: $bg-gradient-sky;
  
  @include mobile {
    padding: $spacing-md;
  }
}
```

### 3. 動畫系統

```scss
// _animations.scss

// 彈跳進入
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// 淡入
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 搖晃（錯誤提示）
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

// 脈衝（吸引注意）
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// 旋轉
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 使用範例
.animated-card {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  animation-delay: var(--delay, 0s);
}

.error-shake {
  animation: shake 0.5s;
}

.attention-pulse {
  animation: pulse 1.5s infinite;
}
```

### 4. BEM 命名規範

```scss
// 區塊 (Block)
.game-card {
  // 元素 (Element)
  &__header { }
  &__title { }
  &__icon { }
  &__description { }
  &__footer { }
  
  // 修飾符 (Modifier)
  &--locked { }
  &--completed { }
  &--featured { }
}

// 範例：
.game-card { }
.game-card__header { }
.game-card__title { }
.game-card--locked { }
```

---

## 測試策略

### 1. 測試環境設定

```javascript
// src/test/setup.js
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

// Mock Web APIs
global.AudioContext = vi.fn(() => ({
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: 'sine'
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      value: 0,
      exponentialRampToValueAtTime: vi.fn()
    }
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn()
}))

global.SpeechSynthesisUtterance = vi.fn()
global.speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn()
}
```

### 2. 元件測試範例

```javascript
// components/StarScore/StarScore.test.jsx
import { render, screen } from '@testing-library/react'
import StarScore from './StarScore'

describe('StarScore', () => {
  it('顯示正確的星星數量', () => {
    render(<StarScore stars={2} max={3} />)
    const activeStars = screen.getAllByText('⭐')
    const inactiveStars = screen.getAllByText('☆')
    expect(activeStars).toHaveLength(2)
    expect(inactiveStars).toHaveLength(1)
  })
})
```

### 3. Hook 測試範例

```javascript
// hooks/useSound.test.js
import { renderHook } from '@testing-library/react'
import { useSound } from './useSound'

describe('useSound', () => {
  it('播放正確音效', () => {
    const { result } = renderHook(() => useSound())
    expect(() => result.current.playCorrect()).not.toThrow()
  })
})
```

### 4. 整合測試範例

```javascript
// games/GameName/GameName.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from '../../contexts/ProfileContext'
import GameName from './GameName'

const renderGame = () => {
  return render(
    <BrowserRouter>
      <ProfileProvider>
        <GameName />
      </ProfileProvider>
    </BrowserRouter>
  )
}

describe('GameName', () => {
  it('顯示難度選擇介面', () => {
    renderGame()
    expect(screen.getByText('初級')).toBeInTheDocument()
  })
  
  it('選擇難度後開始遊戲', async () => {
    renderGame()
    fireEvent.click(screen.getByText('初級'))
    await waitFor(() => {
      expect(screen.getByText(/得分/)).toBeInTheDocument()
    })
  })
})
```

---

## 部署流程

### 1. Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/repo-name/',  // GitHub Pages 路徑
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**']
    }
  }
})
```

### 2. GitHub Actions 自動部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Package.json 腳本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint ."
  }
}
```

---

## 開發建議

### 1. 專案啟動步驟

```bash
# 1. 建立專案
npm create vite@latest project-name -- --template react
cd project-name

# 2. 安裝依賴
npm install react-router-dom sass canvas-confetti

# 3. 安裝開發依賴
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8

# 4. 建立資料夾結構
mkdir -p src/{components,contexts,games,hooks,pages,styles,test}

# 5. 啟動開發伺服器
npm run dev
```

### 2. 開發順序建議

1. **建立基礎架構**
   - 設定 Vite 配置
   - 建立 SCSS 變數與 mixins
   - 設定全域樣式

2. **實作核心系統**
   - ProfileContext（用戶管理）
   - useSound Hook（音效）
   - useSpeak Hook（語音）

3. **開發共用元件**
   - BackButton
   - StarScore
   - WinModal
   - LevelSelect
   - ProfileBar
   - ProfileSelect

4. **建立頁面**
   - Home（首頁遊戲選單）
   - LearningMap（學習路徑地圖）
   - History（學習履歷）
   - About（關於頁面）

5. **開發遊戲**
   - 從最簡單的遊戲開始
   - 遵循標準遊戲模式
   - 逐步增加複雜度

6. **測試與優化**
   - 撰寫單元測試
   - 效能優化
   - 響應式測試

7. **部署上線**
   - 設定 GitHub Actions
   - 部署到 GitHub Pages

### 3. 常見功能實作

#### localStorage 操作
```javascript
// 儲存
localStorage.setItem('key', JSON.stringify(data))

// 讀取
const data = JSON.parse(localStorage.getItem('key') || '[]')

// 刪除
localStorage.removeItem('key')

// 清空
localStorage.clear()
```

#### 陣列隨機排序
```javascript
function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

#### 日期格式化
```javascript
const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

#### 防抖（Debounce）
```javascript
function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

### 4. 效能優化建議

- ✅ 使用 `useCallback` 包裝事件處理函數
- ✅ 使用 `useMemo` 快取計算結果
- ✅ 使用 `React.memo` 防止不必要的重渲染
- ✅ 圖片使用 WebP 格式（或 Emoji 替代）
- ✅ Code Splitting（React.lazy + Suspense）
- ✅ 避免在 render 中建立新物件/陣列
- ✅ 使用 CSS Transform（觸發 GPU 加速）

### 5. 無障礙設計（a11y）

```jsx
// 鍵盤導航
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  aria-label="開始遊戲"
>
  開始
</button>

// 語義化 HTML
<main>
  <nav aria-label="主選單">
    <ul>
      <li><a href="/">首頁</a></li>
    </ul>
  </nav>
</main>

// ARIA 屬性
<div
  role="button"
  aria-pressed={isActive}
  aria-disabled={isDisabled}
>
  按鈕
</div>
```

### 6. 錯誤處理

```javascript
// localStorage 錯誤處理
try {
  localStorage.setItem(key, value)
} catch (error) {
  console.error('儲存失敗', error)
  // 顯示錯誤訊息給用戶
}

// API 錯誤處理（如果使用）
try {
  const response = await fetch(url)
  if (!response.ok) throw new Error('請求失敗')
  return await response.json()
} catch (error) {
  console.error('API 錯誤', error)
  return null
}

// React Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>發生錯誤，請重新整理頁面</h1>
    }
    return this.props.children
  }
}
```

---

## 附錄

### A. 完整 package.json 範本

```json
{
  "name": "kids-learning-platform",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint ."
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1",
    "sass": "^1.97.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "@vitest/coverage-v8": "^4.0.18",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^28.1.0",
    "vite": "^7.3.1",
    "vitest": "^4.0.18"
  }
}
```

### B. ESLint 配置

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '19.2' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

### C. Git 忽略檔案

```gitignore
# .gitignore

# 依賴
node_modules/
.pnp
.pnp.js

# 建構輸出
dist/
build/

# 測試覆蓋率
coverage/

# 環境變數
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日誌
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 編輯器
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~
.DS_Store

# Vite
.vite/
```

---

## 總結

這份文件提供了完整的專案架構和開發指南，涵蓋：

✅ **架構設計** - 清晰的資料夾結構與元件分層  
✅ **狀態管理** - ProfileContext 統一管理用戶與進度  
✅ **遊戲系統** - 五級難度、星星評分、解鎖機制  
✅ **互動設計** - 音效、語音、動畫、回饋系統  
✅ **樣式系統** - SCSS 變數、Mixins、BEM 命名  
✅ **測試策略** - 單元測試、整合測試、覆蓋率  
✅ **部署流程** - GitHub Actions 自動化 CI/CD  

### 適用場景

這個架構適合開發：

- 🎮 兒童教育遊戲平台
- 📚 互動式學習網站
- 🎯 技能訓練應用
- 🏆 成就系統平台
- 👤 多用戶學習追蹤系統

### 核心優勢

1. **無需後端** - 純前端實現，降低開發成本
2. **模組化設計** - 易於擴展和維護
3. **用戶體驗** - 兒童友善的互動設計
4. **進度追蹤** - 完整的學習路徑與成就系統
5. **測試完善** - 高覆蓋率的單元測試
6. **自動部署** - GitHub Actions CI/CD

---

**🎯 使用此文件時，請根據具體專案需求調整：**

- 遊戲類型與數量
- 難度等級設計
- 目標年齡層
- 視覺風格
- 功能需求

**📝 文件版本：** 1.0.0  
**📅 最後更新：** 2026-02-28  
**👨‍💻 參考專案：** Kids Games Playground
