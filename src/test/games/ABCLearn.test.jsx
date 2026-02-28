import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ABCLearn from '../../games/ABCLearn/ABCLearn'

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
      <ABCLearn />
    </MemoryRouter>
  )
}

describe('ABCLearn', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('Menu', () => {
    it('renders game title', () => {
      renderGame()
      expect(screen.getByText('🔤 ABC 英文字母')).toBeInTheDocument()
    })

    it('renders mode selection prompt', () => {
      renderGame()
      expect(screen.getByText('選擇一個學習模式')).toBeInTheDocument()
    })

    it('renders 3 game mode buttons', () => {
      renderGame()
      expect(screen.getByText('📖 認識字母')).toBeInTheDocument()
      expect(screen.getByText('🎯 字母配對')).toBeInTheDocument()
      expect(screen.getByText('🔤 字母排序')).toBeInTheDocument()
    })

    it('renders mode descriptions', () => {
      renderGame()
      expect(screen.getByText('學習 A~Z')).toBeInTheDocument()
      expect(screen.getByText('找出正確的字母')).toBeInTheDocument()
      expect(screen.getByText('按照順序排列')).toBeInTheDocument()
    })

    it('renders back button', () => {
      renderGame()
      expect(screen.getByText('回首頁')).toBeInTheDocument()
    })
  })

  describe('Learn Mode', () => {
    it('enters learn mode and shows first letter', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      expect(screen.getByText('🔤 認識字母')).toBeInTheDocument()
      expect(screen.getByText('Aa')).toBeInTheDocument()
      expect(screen.getByText('Apple')).toBeInTheDocument()
      expect(screen.getByText('🍎')).toBeInTheDocument()
      expect(screen.getByText('蘋果')).toBeInTheDocument()
    })

    it('shows letter counter', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      expect(screen.getByText(/第 1 \/ 26 個字母/)).toBeInTheDocument()
    })

    it('navigates to next letter', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      fireEvent.click(screen.getByText('下一個 ➡️'))
      expect(screen.getByText('Bb')).toBeInTheDocument()
      expect(screen.getByText('Bear')).toBeInTheDocument()
      expect(screen.getByText(/第 2 \/ 26 個字母/)).toBeInTheDocument()
    })

    it('navigates to previous letter', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      fireEvent.click(screen.getByText('下一個 ➡️'))
      fireEvent.click(screen.getByText('⬅️ 上一個'))
      expect(screen.getByText('Aa')).toBeInTheDocument()
    })

    it('previous button is disabled on first letter', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      const prevBtn = screen.getByText('⬅️ 上一個')
      expect(prevBtn).toBeDisabled()
    })

    it('returns to menu via menu button', () => {
      renderGame()
      fireEvent.click(screen.getByText('📖 認識字母'))
      fireEvent.click(screen.getByText('📋 選單'))
      expect(screen.getByText('選擇一個學習模式')).toBeInTheDocument()
    })
  })

  describe('Match Mode', () => {
    it('enters match mode', () => {
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))
      expect(screen.getByText('🎯 字母配對')).toBeInTheDocument()
      expect(screen.getByText('這個字的開頭是什麼字母？')).toBeInTheDocument()
    })

    it('shows stats', () => {
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))
      expect(screen.getByText('📝 1/8')).toBeInTheDocument()
      expect(screen.getByText('✅ 0')).toBeInTheDocument()
    })

    it('shows 4 letter choices', () => {
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))
      const matchBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__match-btn')
      )
      expect(matchBtns).toHaveLength(4)
    })

    it('displays a word and emoji', () => {
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))
      // Should show some word
      const wordEl = document.querySelector('.abc-learn__match-word')
      expect(wordEl).toBeTruthy()
      expect(wordEl.textContent.length).toBeGreaterThan(0)
    })

    it('correct answer advances question', async () => {
      vi.useFakeTimers()
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))

      const wordEl = document.querySelector('.abc-learn__match-word')
      const word = wordEl.textContent
      const firstLetter = word.charAt(0).toUpperCase()

      const matchBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__match-btn')
      )
      const correctBtn = matchBtns.find(btn => btn.textContent === firstLetter)
      if (correctBtn) {
        fireEvent.click(correctBtn)
        await act(async () => { vi.advanceTimersByTime(1200) })
        expect(screen.getByText('✅ 1')).toBeInTheDocument()
      }
      vi.useRealTimers()
    })

    it('wrong answer allows retry', async () => {
      vi.useFakeTimers()
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))

      const wordEl = document.querySelector('.abc-learn__match-word')
      const word = wordEl.textContent
      const firstLetter = word.charAt(0).toUpperCase()

      const matchBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__match-btn')
      )
      const wrongBtn = matchBtns.find(btn => btn.textContent !== firstLetter)
      if (wrongBtn) {
        fireEvent.click(wrongBtn)
        await act(async () => { vi.advanceTimersByTime(1000) })
        expect(screen.getByText('📝 1/8')).toBeInTheDocument()
      }
      vi.useRealTimers()
    })

    it('completing 8 correct answers shows win modal', async () => {
      vi.useFakeTimers()
      renderGame()
      fireEvent.click(screen.getByText('🎯 字母配對'))

      for (let q = 0; q < 8; q++) {
        const wordEl = document.querySelector('.abc-learn__match-word')
        if (!wordEl) break
        const word = wordEl.textContent
        const firstLetter = word.charAt(0).toUpperCase()

        const matchBtns = screen.getAllByRole('button').filter(
          btn => btn.classList.contains('abc-learn__match-btn') && !btn.disabled
        )
        const correctBtn = matchBtns.find(btn => btn.textContent === firstLetter)
        if (correctBtn) {
          fireEvent.click(correctBtn)
          await act(async () => { vi.advanceTimersByTime(1200) })
        }
      }

      await act(async () => { vi.advanceTimersByTime(1000) })
      expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  describe('Order Mode', () => {
    it('enters order mode', () => {
      renderGame()
      fireEvent.click(screen.getByText('🔤 字母排序'))
      expect(screen.getByText('🔤 字母排序')).toBeInTheDocument()
      expect(screen.getByText('按照字母順序點選！')).toBeInTheDocument()
    })

    it('shows 5 letter buttons to order', () => {
      renderGame()
      fireEvent.click(screen.getByText('🔤 字母排序'))
      const orderBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__order-btn')
      )
      expect(orderBtns).toHaveLength(5)
    })

    it('shows question mark placeholder', () => {
      renderGame()
      fireEvent.click(screen.getByText('🔤 字母排序'))
      expect(screen.getByText('?')).toBeInTheDocument()
    })

    it('clicking correct order adds to sequence', () => {
      renderGame()
      fireEvent.click(screen.getByText('🔤 字母排序'))

      const orderBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__order-btn')
      )
      const letters = orderBtns.map(btn => btn.textContent)
      const sorted = [...letters].sort()

      // Click the first letter in order
      const firstBtn = orderBtns.find(btn => btn.textContent === sorted[0])
      fireEvent.click(firstBtn)

      const doneEls = document.querySelectorAll('.abc-learn__order-num.done')
      expect(doneEls).toHaveLength(1)
      expect(doneEls[0].textContent).toBe(sorted[0])
    })

    it('completes order sequence for all 5 letters', async () => {
      vi.useFakeTimers()
      renderGame()
      fireEvent.click(screen.getByText('🔤 字母排序'))

      const orderBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('abc-learn__order-btn')
      )
      const letters = orderBtns.map(btn => btn.textContent)
      const sorted = [...letters].sort()

      for (const letter of sorted) {
        const btn = orderBtns.find(b => b.textContent === letter)
        fireEvent.click(btn)
        await act(async () => { vi.advanceTimersByTime(100) })
      }

      await act(async () => { vi.advanceTimersByTime(1000) })
      expect(screen.getByText('✅ 1')).toBeInTheDocument()
      vi.useRealTimers()
    })
  })
})
