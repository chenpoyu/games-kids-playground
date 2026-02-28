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
      <BalloonPop />
    </MemoryRouter>
  )
  // Games now show LevelSelect first; click '初級' to enter the game
  fireEvent.click(screen.getAllByText('初級')[0])
  return result
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

  it('renders 5 balloons with numbers 1-5', () => {
    renderGame()
    const balloonNumbers = document.querySelectorAll('.balloon__number')
    expect(balloonNumbers).toHaveLength(5)
    const numbers = [...balloonNumbers].map(el => Number(el.textContent)).sort((a, b) => a - b)
    expect(numbers).toEqual([1, 2, 3, 4, 5])
  })

  it('displays next number hint as 1 initially', () => {
    renderGame()
    expect(screen.getByText(/0\/5/)).toBeInTheDocument()
  })

  it('popping correct balloon (1) advances next number', async () => {
    vi.useFakeTimers()
    renderGame()
    const num1 = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === '1')
    const btn1 = num1.closest('button')
    fireEvent.click(btn1)
    await act(async () => { vi.advanceTimersByTime(100) })
    expect(screen.getByText(/1\/5/)).toBeInTheDocument()
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
    expect(screen.getByText(/0\/5/)).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('pops all balloons in order to win', async () => {
    vi.useFakeTimers()
    renderGame()
    for (let i = 1; i <= 5; i++) {
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
    for (let i = 1; i <= 5; i++) {
      const numEl = [...document.querySelectorAll('.balloon__number')].find(el => el.textContent === String(i))
      const btn = numEl.closest('button')
      fireEvent.click(btn)
      await act(async () => { vi.advanceTimersByTime(700) })
    }
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('🔄 再玩一次'))
    expect(screen.getByText(/0\/5/)).toBeInTheDocument()
    vi.useRealTimers()
  })
})
