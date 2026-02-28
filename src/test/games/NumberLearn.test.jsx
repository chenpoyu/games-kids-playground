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
      <NumberLearn />
    </MemoryRouter>
  )
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
    expect(screen.getByText(/第 1\/5 題/)).toBeInTheDocument()
    expect(screen.getByText(/答對 0 題/)).toBeInTheDocument()
    expect(screen.getByText(/第 1 關/)).toBeInTheDocument()
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
      expect(screen.getByText(/第 1\/5 題/)).toBeInTheDocument()
    }
    vi.useRealTimers()
  })

  it('completing 5 correct answers shows win modal', async () => {
    vi.useFakeTimers()
    renderGame()

    for (let q = 0; q < 5; q++) {
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
