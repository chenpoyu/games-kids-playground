import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AnimalPuzzle from '../../games/AnimalPuzzle/AnimalPuzzle'

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
      <AnimalPuzzle />
    </MemoryRouter>
  )
  // Games now show LevelSelect first; click '初級' to enter the game
  fireEvent.click(screen.getAllByText('初級')[0])
  return result
}

describe('AnimalPuzzle', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders game title', () => {
    renderGame()
    expect(screen.getByText('🦁 動物記憶翻翻樂')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderGame()
    expect(screen.getByText('翻開卡片，找出兩隻一樣的動物！')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderGame()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders 6 cards (3 pairs)', () => {
    renderGame()
    const leafCards = screen.getAllByText('🌿')
    expect(leafCards).toHaveLength(6)
  })

  it('displays initial stats', () => {
    renderGame()
    expect(screen.getByText(/找到 0\/3 對/)).toBeInTheDocument()
    expect(screen.getByText(/翻了 0 次/)).toBeInTheDocument()
  })

  it('renders tip text', () => {
    renderGame()
    expect(screen.getByText(/記住每張卡片的位置/)).toBeInTheDocument()
  })

  it('clicking a card does not immediately count as attempt', () => {
    renderGame()
    const cards = screen.getAllByText('🌿')
    fireEvent.click(cards[0].closest('button'))
    expect(screen.getByText(/翻了 0 次/)).toBeInTheDocument()
  })

  it('clicking two cards counts as an attempt', async () => {
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('animal-card'))
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])
    await vi.waitFor(() => {
      expect(screen.getByText(/翻了 1 次/)).toBeInTheDocument()
    })
  })

  it('matching a pair increases match count', async () => {
    vi.useFakeTimers()
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('animal-card'))

    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.animal-card__name')
      return { btn, name: nameEl?.textContent }
    })

    const nameMap = {}
    for (const cd of cardData) {
      if (cd.name) {
        if (nameMap[cd.name]) {
          fireEvent.click(nameMap[cd.name])
          fireEvent.click(cd.btn)
          break
        }
        nameMap[cd.name] = cd.btn
      }
    }

    await act(async () => { vi.advanceTimersByTime(700) })
    expect(screen.getByText(/找到 1\/3 對/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('completes game when all pairs matched', async () => {
    vi.useFakeTimers()
    renderGame()
    const buttons = screen.getAllByRole('button').filter(btn => btn.classList.contains('animal-card'))

    const cardData = buttons.map(btn => {
      const nameEl = btn.querySelector('.animal-card__name')
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
        await act(async () => { vi.advanceTimersByTime(700) })
      }
    }

    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
