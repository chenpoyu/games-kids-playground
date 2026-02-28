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

vi.mock('../../hooks/useProgress', () => ({
  useProgress: () => ({
    progress: { totalStars: 0, gamesPlayed: 0, history: [], achievements: [], lastPlayed: null },
    recordGame: vi.fn(),
    resetProgress: vi.fn(),
    getGameStats: vi.fn(() => ({ totalPlayed: 0, bestStars: 0, avgStars: 0 })),
  }),
}))

function renderGame() {
  return render(
    <MemoryRouter>
      <AnimalPuzzle />
    </MemoryRouter>
  )
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

  it('renders 12 cards (6 pairs)', () => {
    renderGame()
    const leafCards = screen.getAllByText('🌿')
    expect(leafCards).toHaveLength(12)
  })

  it('displays initial stats', () => {
    renderGame()
    expect(screen.getByText(/找到 0\/6 對/)).toBeInTheDocument()
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
    expect(screen.getByText(/找到 1\/6 對/)).toBeInTheDocument()
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
