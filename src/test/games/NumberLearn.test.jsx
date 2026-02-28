import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NumberLearn from '../../games/NumberLearn/NumberLearn'

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
      <NumberLearn />
    </MemoryRouter>
  )
  // Games now show LevelSelect first; click '初級' to enter the game
  fireEvent.click(screen.getAllByText('初級')[0])
  return result
}

describe('NumberLearn', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders game title', () => {
    renderGame()
    expect(screen.getByText('🔢 數字學習')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderGame()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders level 1 subtitle', () => {
    renderGame()
    expect(screen.getByText('認識 1~5')).toBeInTheDocument()
  })

  it('renders stats', () => {
    renderGame()
    expect(screen.getByText(/第 1\/3 題/)).toBeInTheDocument()
    expect(screen.getByText(/答對 0 題/)).toBeInTheDocument()
    expect(screen.getByText(/第 1\/1 關/)).toBeInTheDocument()
  })

  it('renders a count question with items and choices', () => {
    renderGame()
    // Should have a question text like "有幾個 🍎？"
    expect(screen.getByText(/有幾個/)).toBeInTheDocument()
    // Should have 4 choice buttons
    const choiceBtns = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('number-learn__choice')
    )
    expect(choiceBtns).toHaveLength(4)
  })

  it('clicking correct answer increments score and advances', async () => {
    vi.useFakeTimers()
    renderGame()

    // Find the items to count
    const items = document.querySelectorAll('.number-learn__item')
    const correctCount = items.length

    // Find the button with the correct answer
    const choiceBtns = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('number-learn__choice')
    )
    const correctBtn = choiceBtns.find(btn => {
      const numEl = btn.querySelector('.number-learn__choice-number')
      return numEl && Number(numEl.textContent) === correctCount
    })

    if (correctBtn) {
      fireEvent.click(correctBtn)
      await act(async () => { vi.advanceTimersByTime(1200) })
      expect(screen.getByText(/答對 1 題/)).toBeInTheDocument()
    }
    vi.useRealTimers()
  })

  it('clicking wrong answer increments errors and allows retry', async () => {
    vi.useFakeTimers()
    renderGame()

    const items = document.querySelectorAll('.number-learn__item')
    const correctCount = items.length

    const choiceBtns = screen.getAllByRole('button').filter(
      btn => btn.classList.contains('number-learn__choice')
    )
    const wrongBtn = choiceBtns.find(btn => {
      const numEl = btn.querySelector('.number-learn__choice-number')
      return numEl && Number(numEl.textContent) !== correctCount
    })

    if (wrongBtn) {
      fireEvent.click(wrongBtn)
      await act(async () => { vi.advanceTimersByTime(1000) })
      // Still on question 1, can retry
      expect(screen.getByText(/第 1\/3 題/)).toBeInTheDocument()
    }
    vi.useRealTimers()
  })

  it('completing 3 correct answers shows win modal', async () => {
    vi.useFakeTimers()
    renderGame()

    for (let q = 0; q < 3; q++) {
      // Re-query items every iteration since question changes
      const items = document.querySelectorAll('.number-learn__item')
      const correctCount = items.length

      // Re-query buttons every iteration
      const choiceBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('number-learn__choice') && !btn.disabled
      )
      const correctBtn = choiceBtns.find(btn => {
        const numEl = btn.querySelector('.number-learn__choice-number')
        return numEl && Number(numEl.textContent) === correctCount
      })

      expect(correctBtn).toBeTruthy()
      fireEvent.click(correctBtn)
      await act(async () => { vi.advanceTimersByTime(1200) })
    }

    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
