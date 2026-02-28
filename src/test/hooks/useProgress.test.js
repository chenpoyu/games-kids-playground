import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress, ACHIEVEMENTS } from '../../hooks/useProgress'

describe('useProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns default progress on first load', () => {
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress).toEqual({
      totalStars: 0,
      gamesPlayed: 0,
      history: [],
      achievements: [],
      lastPlayed: null,
    })
  })

  it('records a game and updates stats', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 2, '4x4 模式')
    })
    expect(result.current.progress.totalStars).toBe(2)
    expect(result.current.progress.gamesPlayed).toBe(1)
    expect(result.current.progress.history).toHaveLength(1)
    expect(result.current.progress.history[0].gameId).toBe('color-match')
    expect(result.current.progress.history[0].gameName).toBe('顏色配對')
    expect(result.current.progress.history[0].stars).toBe(2)
  })

  it('awards first-game achievement', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 1)
    })
    expect(result.current.progress.achievements).toContain('first-game')
  })

  it('awards perfect-game achievement for 3 stars', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 3)
    })
    expect(result.current.progress.achievements).toContain('perfect-game')
  })

  it('awards ten-games achievement after 10 games', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.recordGame('color-match', '顏色配對', 1)
      }
    })
    expect(result.current.progress.achievements).toContain('ten-games')
  })

  it('awards fifty-stars achievement', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      for (let i = 0; i < 17; i++) {
        result.current.recordGame('color-match', '顏色配對', 3)
      }
    })
    expect(result.current.progress.totalStars).toBe(51)
    expect(result.current.progress.achievements).toContain('fifty-stars')
  })

  it('awards explorer achievement when all 6 games tried', () => {
    const { result } = renderHook(() => useProgress())
    const games = [
      ['color-match', '顏色配對'],
      ['animal-puzzle', '動物翻翻樂'],
      ['balloon-pop', '數字氣球'],
      ['shape-sort', '形狀排排看'],
      ['number-learn', '數字學習'],
      ['abc-learn', 'ABC 字母'],
    ]
    act(() => {
      games.forEach(([id, name]) => {
        result.current.recordGame(id, name, 1)
      })
    })
    expect(result.current.progress.achievements).toContain('explorer')
  })

  it('persists progress to localStorage', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 2)
    })
    const saved = JSON.parse(localStorage.getItem('kids-playground-progress'))
    expect(saved.totalStars).toBe(2)
    expect(saved.gamesPlayed).toBe(1)
  })

  it('loads persisted progress from localStorage', () => {
    const savedData = {
      totalStars: 15,
      gamesPlayed: 5,
      history: [],
      achievements: ['first-game'],
      lastPlayed: '2026-01-01T00:00:00.000Z',
    }
    localStorage.setItem('kids-playground-progress', JSON.stringify(savedData))
    const { result } = renderHook(() => useProgress())
    expect(result.current.progress.totalStars).toBe(15)
    expect(result.current.progress.gamesPlayed).toBe(5)
    expect(result.current.progress.achievements).toContain('first-game')
  })

  it('resets progress', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 3)
    })
    expect(result.current.progress.totalStars).toBe(3)
    act(() => {
      result.current.resetProgress()
    })
    expect(result.current.progress.totalStars).toBe(0)
    expect(result.current.progress.gamesPlayed).toBe(0)
    expect(result.current.progress.history).toHaveLength(0)
    expect(result.current.progress.achievements).toHaveLength(0)
  })

  it('getGameStats returns correct stats', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      result.current.recordGame('color-match', '顏色配對', 2)
      result.current.recordGame('color-match', '顏色配對', 3)
      result.current.recordGame('animal-puzzle', '動物翻翻樂', 1)
    })
    const stats = result.current.getGameStats('color-match')
    expect(stats.totalPlayed).toBe(2)
    expect(stats.bestStars).toBe(3)
    expect(Number(stats.avgStars)).toBeCloseTo(2.5)
  })

  it('keeps only last 100 history entries', () => {
    const { result } = renderHook(() => useProgress())
    act(() => {
      for (let i = 0; i < 105; i++) {
        result.current.recordGame('color-match', '顏色配對', 1)
      }
    })
    expect(result.current.progress.history).toHaveLength(100)
  })
})

describe('ACHIEVEMENTS', () => {
  it('has all achievement definitions', () => {
    expect(ACHIEVEMENTS['first-game']).toBeDefined()
    expect(ACHIEVEMENTS['ten-games']).toBeDefined()
    expect(ACHIEVEMENTS['fifty-stars']).toBeDefined()
    expect(ACHIEVEMENTS['perfect-game']).toBeDefined()
    expect(ACHIEVEMENTS['explorer']).toBeDefined()
  })

  it('each achievement has emoji, title and desc', () => {
    Object.values(ACHIEVEMENTS).forEach(a => {
      expect(a.emoji).toBeDefined()
      expect(a.title).toBeDefined()
      expect(a.desc).toBeDefined()
    })
  })
})
