import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../../pages/Home/Home'

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
    progress: { totalStars: 10, gamesPlayed: 3, history: [], achievements: ['first-game'], lastPlayed: null },
    recordGame: vi.fn(),
    resetProgress: vi.fn(),
    getGameStats: vi.fn(() => ({ totalPlayed: 0, bestStars: 0, avgStars: 0 })),
  }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe('Home', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders title characters', () => {
    renderPage()
    expect(screen.getByText('歡')).toBeInTheDocument()
    expect(screen.getByText('園')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderPage()
    expect(screen.getByText(/和小動物們一起玩遊戲/)).toBeInTheDocument()
  })

  it('renders progress stats', () => {
    renderPage()
    expect(screen.getByText('10')).toBeInTheDocument() // totalStars
    expect(screen.getByText('3')).toBeInTheDocument()  // gamesPlayed
    expect(screen.getByText('1')).toBeInTheDocument()  // achievements.length
  })

  it('renders progress labels', () => {
    renderPage()
    expect(screen.getByText('星星')).toBeInTheDocument()
    expect(screen.getByText('遊戲')).toBeInTheDocument()
    expect(screen.getByText('成就')).toBeInTheDocument()
  })

  it('renders game section title', () => {
    renderPage()
    expect(screen.getByText('🎯 趣味遊戲')).toBeInTheDocument()
  })

  it('renders learn section title', () => {
    renderPage()
    expect(screen.getByText('📖 學習專區')).toBeInTheDocument()
  })

  it('renders 4 game cards', () => {
    renderPage()
    expect(screen.getByText('顏色配對')).toBeInTheDocument()
    expect(screen.getByText('動物翻翻樂')).toBeInTheDocument()
    expect(screen.getByText('數字氣球')).toBeInTheDocument()
    expect(screen.getByText('形狀排排看')).toBeInTheDocument()
  })

  it('renders 2 learn cards', () => {
    renderPage()
    expect(screen.getByText('數字學習')).toBeInTheDocument()
    expect(screen.getByText('ABC 字母')).toBeInTheDocument()
  })

  it('renders link buttons', () => {
    renderPage()
    expect(screen.getByText('📚 學習履歷')).toBeInTheDocument()
    expect(screen.getByText('ℹ️ 關於我們')).toBeInTheDocument()
  })

  it('renders footer', () => {
    renderPage()
    expect(screen.getByText('© 2026 Poyu.Chen')).toBeInTheDocument()
  })

  it('renders decorations', () => {
    renderPage()
    const clouds = screen.getAllByText('☁️')
    expect(clouds.length).toBeGreaterThanOrEqual(3)
  })

  it('clicking a game card navigates to the game', () => {
    renderPage()
    const colorMatch = screen.getByText('顏色配對').closest('button')
    fireEvent.click(colorMatch)
    expect(mockNavigate).toHaveBeenCalledWith('/color-match')
  })

  it('clicking learn card navigates to the game', () => {
    renderPage()
    const numberLearn = screen.getByText('數字學習').closest('button')
    fireEvent.click(numberLearn)
    expect(mockNavigate).toHaveBeenCalledWith('/number-learn')
  })

  it('clicking history link navigates to history', () => {
    renderPage()
    fireEvent.click(screen.getByText('📚 學習履歷'))
    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })

  it('clicking about link navigates to about', () => {
    renderPage()
    fireEvent.click(screen.getByText('ℹ️ 關於我們'))
    expect(mockNavigate).toHaveBeenCalledWith('/about')
  })

  it('clicking progress items navigates to history', () => {
    renderPage()
    const starItem = screen.getByText('星星').closest('.home__progress-item')
    fireEvent.click(starItem)
    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })
})
