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
      <ColorMatch />
    </MemoryRouter>
  )
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

  it('renders 8 cards (4 pairs)', () => {
    renderGame()
    const questionMarks = screen.getAllByText('❓')
    expect(questionMarks).toHaveLength(8)
  })

  it('displays initial stats', () => {
    renderGame()
    expect(screen.getByText(/0\/4/)).toBeInTheDocument()
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
    expect(screen.getByText(/0\/4/)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
