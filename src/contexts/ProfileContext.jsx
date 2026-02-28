import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'kids-playground-profiles'

const defaultProfile = {
  id: '',
  name: '',
  avatar: '🧒',
  age: 4,
  createdAt: '',
  // 闖關進度：每個遊戲有 beginner / intermediate / advanced 三個級別
  levelProgress: {},
  // 學習路徑解鎖狀態
  unlockedGames: ['color-match', 'shape-sort'], // 預設解鎖基礎遊戲
  totalStars: 0,
  gamesPlayed: 0,
  history: [],
  achievements: [],
  lastPlayed: null,
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activeProfileId, setActiveProfileId] = useState(() => {
    try {
      return localStorage.getItem('kids-playground-active-profile') || null
    } catch {
      return null
    }
  })

  // 儲存至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    } catch { /* ignore */ }
  }, [profiles])

  useEffect(() => {
    try {
      if (activeProfileId) {
        localStorage.setItem('kids-playground-active-profile', activeProfileId)
      } else {
        localStorage.removeItem('kids-playground-active-profile')
      }
    } catch { /* ignore */ }
  }, [activeProfileId])

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null

  const createProfile = useCallback((name, avatar, age) => {
    const id = `profile-${Date.now()}`
    const newProfile = {
      ...defaultProfile,
      id,
      name,
      avatar,
      age: Number(age),
      createdAt: new Date().toISOString(),
      // 根據年齡決定預設解鎖遊戲
      unlockedGames: getDefaultUnlockedGames(Number(age)),
    }
    setProfiles(prev => [...prev, newProfile])
    setActiveProfileId(id)
    return id
  }, [])

  const switchProfile = useCallback((id) => {
    setActiveProfileId(id)
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id))
    if (activeProfileId === id) {
      setActiveProfileId(null)
    }
  }, [activeProfileId])

  const updateProfile = useCallback((id, updates) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  // 記錄遊戲結果 (含關卡級別)
  const recordGame = useCallback((gameId, gameName, stars, details = '', level = 'beginner') => {
    if (!activeProfileId) return

    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p

      const entry = {
        id: Date.now(),
        gameId,
        gameName,
        stars,
        details,
        level,
        date: new Date().toISOString(),
      }

      const newHistory = [entry, ...p.history].slice(0, 200)
      const newTotalStars = p.totalStars + stars
      const gamesPlayed = p.gamesPlayed + 1

      // 更新關卡進度
      const newLevelProgress = { ...p.levelProgress }
      if (!newLevelProgress[gameId]) {
        newLevelProgress[gameId] = { beginner: 0, intermediate: 0, advanced: 0, bestStars: {} }
      }
      const gameProg = newLevelProgress[gameId]
      // 記錄該級別最佳成績
      if (!gameProg.bestStars[level] || stars > gameProg.bestStars[level]) {
        gameProg.bestStars[level] = stars
      }
      // 累計通過次數
      gameProg[level] = (gameProg[level] || 0) + 1

      // 解鎖下一級（通用 5 級解鎖邏輯）
      const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert', 'master']
      const currentIdx = levelOrder.indexOf(level)
      if (currentIdx >= 0 && currentIdx < levelOrder.length - 1 && stars >= 2) {
        const nextLevel = levelOrder[currentIdx + 1]
        const unlockKey = `${nextLevel}Unlocked`
        if (!gameProg[unlockKey]) {
          gameProg[unlockKey] = true
        }
      }

      // 解鎖新遊戲 (學習拓樸)
      const newUnlockedGames = [...p.unlockedGames]
      const unlockRules = getUnlockRules()
      for (const rule of unlockRules) {
        if (!newUnlockedGames.includes(rule.gameId)) {
          const meetsRequirement = rule.requires.every(req => {
            const prog = newLevelProgress[req.gameId]
            if (!prog) return false
            const bestForLevel = prog.bestStars?.[req.level] || 0
            return bestForLevel >= (req.minStars || 1)
          })
          if (meetsRequirement) {
            newUnlockedGames.push(rule.gameId)
          }
        }
      }

      // 成就檢查
      const newAchievements = [...p.achievements]
      if (gamesPlayed === 1 && !newAchievements.includes('first-game')) {
        newAchievements.push('first-game')
      }
      if (gamesPlayed >= 10 && !newAchievements.includes('ten-games')) {
        newAchievements.push('ten-games')
      }
      if (newTotalStars >= 50 && !newAchievements.includes('fifty-stars')) {
        newAchievements.push('fifty-stars')
      }
      if (stars === 3 && !newAchievements.includes('perfect-game')) {
        newAchievements.push('perfect-game')
      }
      const allGameIds = new Set(newHistory.map(h => h.gameId))
      if (allGameIds.size >= 9 && !newAchievements.includes('explorer')) {
        newAchievements.push('explorer')
      }
      // 全部高級通關
      const advancedCleared = Object.values(newLevelProgress).filter(
        lp => lp.bestStars?.advanced >= 2
      ).length
      if (advancedCleared >= 9 && !newAchievements.includes('master')) {
        newAchievements.push('master')
      }

      return {
        ...p,
        totalStars: newTotalStars,
        gamesPlayed,
        history: newHistory,
        achievements: newAchievements,
        levelProgress: newLevelProgress,
        unlockedGames: newUnlockedGames,
        lastPlayed: new Date().toISOString(),
      }
    }))
  }, [activeProfileId])

  const getGameStats = useCallback((gameId) => {
    if (!activeProfile) return { totalPlayed: 0, bestStars: 0, avgStars: 0 }
    const gameHistory = activeProfile.history.filter(h => h.gameId === gameId)
    const totalPlayed = gameHistory.length
    const bestStars = gameHistory.reduce((best, h) => Math.max(best, h.stars), 0)
    const avgStars = totalPlayed > 0
      ? (gameHistory.reduce((sum, h) => sum + h.stars, 0) / totalPlayed).toFixed(1)
      : 0
    return { totalPlayed, bestStars, avgStars }
  }, [activeProfile])

  const resetProgress = useCallback(() => {
    if (!activeProfileId) return
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p
      return {
        ...p,
        totalStars: 0,
        gamesPlayed: 0,
        history: [],
        achievements: [],
        levelProgress: {},
        unlockedGames: getDefaultUnlockedGames(p.age),
        lastPlayed: null,
      }
    }))
  }, [activeProfileId])

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      activeProfileId,
      createProfile,
      switchProfile,
      deleteProfile,
      updateProfile,
      recordGame,
      getGameStats,
      resetProgress,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}

// === 根據年齡決定預設解鎖遊戲 ===
function getDefaultUnlockedGames(age) {
  // 2歲：顏色配對、形狀排排看 (基礎感知)
  const base = ['color-match', 'shape-sort']
  if (age >= 3) {
    base.push('animal-puzzle', 'balloon-pop', 'number-learn')
  }
  if (age >= 4) {
    base.push('abc-learn', 'zhuyin-learn', 'math-basic', 'chinese-char')
  }
  return base
}

// === 學習拓樸解鎖規則 ===
function getUnlockRules() {
  return [
    // 動物翻翻樂：需要顏色配對初級2星
    {
      gameId: 'animal-puzzle',
      requires: [{ gameId: 'color-match', level: 'beginner', minStars: 2 }],
    },
    // 數字氣球：需要形狀排排看初級2星
    {
      gameId: 'balloon-pop',
      requires: [{ gameId: 'shape-sort', level: 'beginner', minStars: 2 }],
    },
    // 數字學習：需要數字氣球初級2星
    {
      gameId: 'number-learn',
      requires: [{ gameId: 'balloon-pop', level: 'beginner', minStars: 2 }],
    },
    // ABC字母：需要數字學習初級2星 + 動物翻翻樂初級2星
    {
      gameId: 'abc-learn',
      requires: [
        { gameId: 'number-learn', level: 'beginner', minStars: 2 },
        { gameId: 'animal-puzzle', level: 'beginner', minStars: 2 },
      ],
    },
    // 注音符號：需要ABC字母初級2星
    {
      gameId: 'zhuyin-learn',
      requires: [{ gameId: 'abc-learn', level: 'beginner', minStars: 2 }],
    },
    // 簡易加減法：需要數字學習初級2星
    {
      gameId: 'math-basic',
      requires: [{ gameId: 'number-learn', level: 'beginner', minStars: 2 }],
    },
    // 簡易中文字：需要注音符號初級2星
    {
      gameId: 'chinese-char',
      requires: [{ gameId: 'zhuyin-learn', level: 'beginner', minStars: 2 }],
    },
  ]
}

// 成就定義
export const ACHIEVEMENTS = {
  'first-game': { emoji: '🎉', title: '初次冒險', desc: '完成第一個遊戲' },
  'ten-games': { emoji: '🔥', title: '遊戲達人', desc: '完成 10 個遊戲' },
  'fifty-stars': { emoji: '🌟', title: '星星收藏家', desc: '累積 50 顆星星' },
  'perfect-game': { emoji: '👑', title: '完美通關', desc: '獲得 3 顆星' },
  'explorer': { emoji: '🗺️', title: '探險家', desc: '嘗試所有遊戲' },
  'master': { emoji: '🏅', title: '大師', desc: '所有遊戲高級過關' },
}

// 年齡分級定義
export const AGE_GROUPS = [
  {
    age: 2,
    label: '2歲 · 啟蒙探索',
    emoji: '🌱',
    color: '#4ECDC4',
    description: '顏色與形狀認知，簡單配對',
    games: ['color-match', 'shape-sort'],
  },
  {
    age: 3,
    label: '3歲 · 基礎學習',
    emoji: '🌿',
    color: '#34D399',
    description: '記憶訓練、數字啟蒙',
    games: ['color-match', 'shape-sort', 'animal-puzzle', 'balloon-pop'],
  },
  {
    age: 4,
    label: '4歲 · 進階挑戰',
    emoji: '🌳',
    color: '#60A5FA',
    description: '數字、字母、注音、中文字學習',
    games: ['color-match', 'shape-sort', 'animal-puzzle', 'balloon-pop', 'number-learn', 'abc-learn', 'zhuyin-learn', 'math-basic', 'chinese-char'],
  },
  {
    age: 5,
    label: '5歲 · 綜合運用',
    emoji: '🌟',
    color: '#A78BFA',
    description: '挑戰中級與高級關卡',
    games: ['color-match', 'shape-sort', 'animal-puzzle', 'balloon-pop', 'number-learn', 'abc-learn', 'zhuyin-learn', 'math-basic', 'chinese-char'],
  },
  {
    age: 6,
    label: '6歲 · 挑戰大師',
    emoji: '🏆',
    color: '#FB923C',
    description: '全關卡高難度挑戰',
    games: ['color-match', 'shape-sort', 'animal-puzzle', 'balloon-pop', 'number-learn', 'abc-learn', 'zhuyin-learn', 'math-basic', 'chinese-char'],
  },
]

// 級別定義 (5 levels)
export const DIFFICULTY_LEVELS = {
  beginner: { label: '初級', emoji: '⭐', color: '#4ECDC4', description: '基礎入門' },
  intermediate: { label: '中級', emoji: '⭐⭐', color: '#60A5FA', description: '進階挑戰' },
  advanced: { label: '高級', emoji: '⭐⭐⭐', color: '#FB923C', description: '高手過招' },
  expert: { label: '專家', emoji: '🌟', color: '#E040FB', description: '專家級別' },
  master: { label: '大師', emoji: '👑', color: '#FF6B6B', description: '最終挑戰' },
}

// 級別順序 (用於判斷下一級)
export const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert', 'master']

export function getNextLevel(currentLevel) {
  const idx = LEVEL_ORDER.indexOf(currentLevel)
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null
  return LEVEL_ORDER[idx + 1]
}
