import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'kids-playground-progress'

const defaultProgress = {
  totalStars: 0,
  gamesPlayed: 0,
  history: [],
  achievements: [],
  lastPlayed: null,
}

/**
 * 學習進度管理 Hook
 * 使用 localStorage 保存積分與學習履歷
 */
export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress
    } catch {
      return defaultProgress
    }
  })

  // Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Storage full or unavailable
    }
  }, [progress])

  const recordGame = useCallback((gameId, gameName, stars, details = '') => {
    setProgress(prev => {
      const entry = {
        id: Date.now(),
        gameId,
        gameName,
        stars,
        details,
        date: new Date().toISOString(),
      }

      const newHistory = [entry, ...prev.history].slice(0, 100) // Keep last 100 entries
      const newTotalStars = prev.totalStars + stars

      // Check achievements
      const newAchievements = [...prev.achievements]
      const gamesPlayed = prev.gamesPlayed + 1

      // First game achievement
      if (gamesPlayed === 1 && !newAchievements.includes('first-game')) {
        newAchievements.push('first-game')
      }
      // 10 games achievement
      if (gamesPlayed >= 10 && !newAchievements.includes('ten-games')) {
        newAchievements.push('ten-games')
      }
      // 50 stars achievement
      if (newTotalStars >= 50 && !newAchievements.includes('fifty-stars')) {
        newAchievements.push('fifty-stars')
      }
      // Perfect game (3 stars)
      if (stars === 3 && !newAchievements.includes('perfect-game')) {
        newAchievements.push('perfect-game')
      }
      // All games tried
      const allGameIds = new Set(newHistory.map(h => h.gameId))
      if (allGameIds.size >= 6 && !newAchievements.includes('explorer')) {
        newAchievements.push('explorer')
      }

      return {
        totalStars: newTotalStars,
        gamesPlayed,
        history: newHistory,
        achievements: newAchievements,
        lastPlayed: new Date().toISOString(),
      }
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(defaultProgress)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getGameStats = useCallback((gameId) => {
    const gameHistory = progress.history.filter(h => h.gameId === gameId)
    const totalPlayed = gameHistory.length
    const bestStars = gameHistory.reduce((best, h) => Math.max(best, h.stars), 0)
    const avgStars = totalPlayed > 0
      ? (gameHistory.reduce((sum, h) => sum + h.stars, 0) / totalPlayed).toFixed(1)
      : 0
    return { totalPlayed, bestStars, avgStars }
  }, [progress.history])

  return {
    progress,
    recordGame,
    resetProgress,
    getGameStats,
  }
}

// Achievement definitions
export const ACHIEVEMENTS = {
  'first-game': { emoji: '🎉', title: '初次冒險', desc: '完成第一個遊戲' },
  'ten-games': { emoji: '🔥', title: '遊戲達人', desc: '完成 10 個遊戲' },
  'fifty-stars': { emoji: '🌟', title: '星星收藏家', desc: '累積 50 顆星星' },
  'perfect-game': { emoji: '👑', title: '完美通關', desc: '獲得 3 顆星' },
  'explorer': { emoji: '🗺️', title: '探險家', desc: '嘗試所有遊戲' },
}
