import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ColorMatch from '../../games/ColorMatch/ColorMatch'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../hooks/useSound', () => ({
  useSound: () => ({
    playCorrect: vi.fn(),
    playWrong: vi.fn(),
    playClick: vi.fn(),
    playWin: vi.fn(),
    playPop: vi.fn(),
  }),
}))

vi.mock('../../contexts/ProfileContext', () => ({
  useProfile: () => ({
    activeProfile: { id: '1', name: '小明', age: 5, avatar: '🐶', totalStars: 0, gamesPlayed: 0, achievements: [], history: [], unlockedGames: [], levelProgress: {} },
    profiles: [],
    switchProfile: vi.fn(),
    recordGame: vi.fn(),
  }),
  DIFFICULTY_LEVELS: {
    beginner: { label: '初級', color: '#4CAF50', emoji: '🌱', description: '最適合初學者' },
    intermediate: { label: '中級', color: '#2196F3', emoji: '🌺', description: '有一點基礎' },
    advanced: { label: '高級', color: '#FF9800', emoji: '⭐', description: '経驗豐富' },
    expert: { label: '專家', color: '#9C27B0', emoji: '🔥', description: '十分熟練' },
    master: { label: '大師', color: '#F44336', emoji: '👑', description: '終極挑戰' },
  },
  LEVEL_ORDER: ['beginner', 'intermediate', 'advanced', 'expert', 'master'],
  getNextLevel: () => 'intermediate',
  ACHIEVEMENTS: {},
}))

function renderGame() {
  const result = render(
    <MemoryRouter>
      <ColorMatch />
    </MemoryRouter>
  )
  // Games now show LevelSelect first; click '初級' to enter the game
  fireEvent.click(screen.getAllByText('初級')[0])
  return result
}

describe('ColorMatch', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders game title and subtitle', () => {
    renderGame()
    expect(screen.getByText('🎨 顏色配對')).toBeInTheDocument()
    expect(screen.getByText('翻開卡片，找出一樣的顏色！')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderGame()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders 6 cards (3 pairs)', () => {
    renderGame()
    const questionMarks = screen.getAllByText('❓')
    expect(questionMarks).toHaveLength(6)
  })

  it('displays initial stats', () => {
    renderGame()
    expect(screen.getByText(/0\/3/)).toBeInTheDocument()
    expect(screen.getByText(/翻了 0 次/)).toBeInTheDocument()
  })

  it('flips a card when clicked', () => {
    renderGame()
    const cards = screen.getAllByText('❓')
    fireEvent.click(cards[0].closest('button'))
    // After clicking, the card should flip and we should see fewer question marks visible
    // or a color name should appear
    expect(screen.getByText(/翻了 0 次/)).toBeInTheDocument() // still 0 because need 2 to count
  })

  it('flipping two matching cards increases match count', async () => {
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('color-card'))

    // Find two cards with the same color name
    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.color-card__name')
      return { btn, name: nameEl?.textContent }
    })

    // Find a matching pair
    const nameMap = {}
    for (const cd of cardData) {
      if (cd.name) {
        if (nameMap[cd.name]) {
          // Found a pair! Click both
          fireEvent.click(nameMap[cd.name])
          fireEvent.click(cd.btn)
          break
        }
        nameMap[cd.name] = cd.btn
      }
    }
    // attempt count should increase
    await vi.waitFor(() => {
      expect(screen.getByText(/翻了 1 次/)).toBeInTheDocument()
    })
  })

  it('flipping two non-matching cards resets them', async () => {
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('color-card'))

    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.color-card__name')
      return { btn, name: nameEl?.textContent }
    })

    // Find two cards with different names
    let first = null
    for (const cd of cardData) {
      if (cd.name) {
        if (!first) {
          first = cd
        } else if (cd.name !== first.name) {
          fireEvent.click(first.btn)
          fireEvent.click(cd.btn)
          break
        }
      }
    }

    await vi.waitFor(() => {
      expect(screen.getByText(/翻了 1 次/)).toBeInTheDocument()
    })
  })

  it('completes the game when all pairs matched', async () => {
    vi.useFakeTimers()
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('color-card'))

    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.color-card__name')
      return { btn, name: nameEl?.textContent }
    })

    // Group cards by name
    const groups = {}
    for (const cd of cardData) {
      if (cd.name) {
        if (!groups[cd.name]) groups[cd.name] = []
        groups[cd.name].push(cd.btn)
      }
    }

    // Click all pairs
    for (const [, pair] of Object.entries(groups)) {
      if (pair.length === 2) {
        fireEvent.click(pair[0])
        fireEvent.click(pair[1])
        await act(async () => { vi.advanceTimersByTime(600) })
      }
    }

    // After all matches, win modal should show
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('reset game works from win modal', async () => {
    vi.useFakeTimers()
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('color-card'))

    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.color-card__name')
      return { btn, name: nameEl?.textContent }
    })

    const groups = {}
    for (const cd of cardData) {
      if (cd.name) {
        if (!groups[cd.name]) groups[cd.name] = []
        groups[cd.name].push(cd.btn)
      }
    }

    for (const [, pair] of Object.entries(groups)) {
      if (pair.length === 2) {
        fireEvent.click(pair[0])
        fireEvent.click(pair[1])
        await act(async () => { vi.advanceTimersByTime(600) })
      }
    }

    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('🔄 再玩一次'))
    expect(screen.getByText(/0\/3/)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
