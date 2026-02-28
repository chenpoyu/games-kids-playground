import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BalloonPop from '../../games/BalloonPop/BalloonPop'

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
      <BalloonPop />
    </MemoryRouter>
  )
}

describe('BalloonPop', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders game title', () => {
    renderGame()
    expect(screen.getByText('🎈 數字氣球')).toBeInTheDocument()
  })

  it('renders subtitle with instructions', () => {
    renderGame()
    expect(screen.getByText(/的順序戳氣球/)).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderGame()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders 7 balloons with numbers 1-7', () => {
    renderGame()
    const balloonNumbers = document.querySelectorAll('.balloon__number')
    expect(balloonNumbers).toHaveLength(7)
    const numbers = [...balloonNumbers].map(el => Number(el.textContent)).sort((a, b) => a - b)
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('displays next number hint as 1 initially', () => {
    renderGame()
    expect(screen.getByText(/0\/7/)).toBeInTheDocument()
  })

  it('popping correct balloon (1) advances next number', async () => {
    vi.useFakeTimers()
    renderGame()
    const num1 = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === '1')
    const btn1 = num1.closest('button')
    fireEvent.click(btn1)
    await act(async () => { vi.advanceTimersByTime(100) })
    expect(screen.getByText(/1\/7/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('popping wrong balloon adds error and shows shake', async () => {
    vi.useFakeTimers()
    renderGame()
    // Click balloon 3 first (wrong, should be 1)
    const num3 = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === '3')
    const btn3 = num3.closest('button')
    fireEvent.click(btn3)
    await act(async () => { vi.advanceTimersByTime(100) })
    // Still 0 popped
    expect(screen.getByText(/0\/7/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('pops all balloons in order to win', async () => {
    vi.useFakeTimers()
    renderGame()
    for (let i = 1; i <= 7; i++) {
      const numEl = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === String(i))
      const btn = numEl.closest('button')
      fireEvent.click(btn)
      await act(async () => { vi.advanceTimersByTime(700) })
    }
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows clouds in the background', () => {
    renderGame()
    const clouds = screen.getAllByText('☁️')
    expect(clouds.length).toBeGreaterThanOrEqual(3)
  })

  it('reset works after winning', async () => {
    vi.useFakeTimers()
    renderGame()
    for (let i = 1; i <= 7; i++) {
      const numEl = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === String(i))
      const btn = numEl.closest('button')
      fireEvent.click(btn)
      await act(async () => { vi.advanceTimersByTime(700) })
    }
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('🔄 再玩一次'))
    expect(screen.getByText(/0\/7/)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
