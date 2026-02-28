import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import History from '../../pages/History/History'

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

const mockResetProgress = vi.fn()
let mockActiveProfile = {
  id: '1', name: '小明', age: 5, avatar: '🐶',
  totalStars: 15,
  gamesPlayed: 5,
  history: [
    { id: 1, gameId: 'color-match', gameName: '顏色配對', stars: 3, details: '翻了 6 次', date: '2026-02-01T10:30:00.000Z' },
    { id: 2, gameId: 'animal-puzzle', gameName: '動物翻翻樂', stars: 2, details: '翻了 12 次', date: '2026-02-01T11:00:00.000Z' },
  ],
  achievements: ['first-game', 'perfect-game'],
  unlockedGames: [],
  levelProgress: {},
}

vi.mock('../../contexts/ProfileContext', () => ({
  useProfile: () => ({
    activeProfile: mockActiveProfile,
    profiles: [],
    switchProfile: vi.fn(),
    resetProgress: mockResetProgress,
  }),
  ACHIEVEMENTS: {
    'first-game': { emoji: '🎉', title: '初次冒險', desc: '完成第一個遊戲' },
    'ten-games': { emoji: '🔥', title: '遊戲達人', desc: '完成 10 個遊戲' },
    'fifty-stars': { emoji: '🌟', title: '星星收藏家', desc: '累積 50 顆星星' },
    'perfect-game': { emoji: '👑', title: '完美通關', desc: '獲得 3 顆星' },
    'explorer': { emoji: '🗺️', title: '探險家', desc: '嘗試所有遊戲' },
  },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <History />
    </MemoryRouter>
  )
}

describe('History', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockResetProgress.mockClear()
  })

  it('renders page title', () => {
    renderPage()
    expect(screen.getByText('📚 小明 的學習履歷')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderPage()
    expect(screen.getByText('看看你的學習成果吧！')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderPage()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders overview stats', () => {
    renderPage()
    expect(screen.getByText('15')).toBeInTheDocument()  // totalStars
    expect(screen.getByText('5')).toBeInTheDocument()   // gamesPlayed
    expect(screen.getByText('2')).toBeInTheDocument()   // achievements count
  })

  it('renders stat labels', () => {
    renderPage()
    expect(screen.getByText('總星星數')).toBeInTheDocument()
    expect(screen.getByText('遊戲次數')).toBeInTheDocument()
    expect(screen.getByText('成就數量')).toBeInTheDocument()
  })

  it('renders achievements section title', () => {
    renderPage()
    expect(screen.getByText('🏅 成就')).toBeInTheDocument()
  })

  it('renders unlocked achievements with emoji', () => {
    renderPage()
    expect(screen.getByText('🎉')).toBeInTheDocument() // first-game unlocked
    expect(screen.getByText('👑')).toBeInTheDocument() // perfect-game unlocked
    expect(screen.getByText('初次冒險')).toBeInTheDocument()
    expect(screen.getByText('完美通關')).toBeInTheDocument()
  })

  it('renders locked achievements with lock emoji', () => {
    renderPage()
    // ten-games, fifty-stars, explorer are locked
    const locks = screen.getAllByText('🔒')
    expect(locks).toHaveLength(3)
  })

  it('renders history section title', () => {
    renderPage()
    expect(screen.getByText('📝 遊玩紀錄')).toBeInTheDocument()
  })

  it('renders history entries', () => {
    renderPage()
    expect(screen.getByText('顏色配對')).toBeInTheDocument()
    expect(screen.getByText('動物翻翻樂')).toBeInTheDocument()
    expect(screen.getByText('翻了 6 次')).toBeInTheDocument()
    expect(screen.getByText('翻了 12 次')).toBeInTheDocument()
  })

  it('renders stars display for history entries', () => {
    renderPage()
    // 3 stars: ⭐⭐⭐
    // 2 stars: ⭐⭐☆
    expect(screen.getByText('⭐⭐⭐')).toBeInTheDocument()
    expect(screen.getByText('⭐⭐☆')).toBeInTheDocument()
  })

  it('renders reset button', () => {
    renderPage()
    expect(screen.getByText('🗑️ 清除紀錄')).toBeInTheDocument()
  })

  it('reset button calls confirm and resetProgress', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage()
    fireEvent.click(screen.getByText('🗑️ 清除紀錄'))
    expect(window.confirm).toHaveBeenCalled()
    expect(mockResetProgress).toHaveBeenCalledTimes(1)
    window.confirm.mockRestore()
  })

  it('reset button does nothing if cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderPage()
    fireEvent.click(screen.getByText('🗑️ 清除紀錄'))
    expect(mockResetProgress).not.toHaveBeenCalled()
    window.confirm.mockRestore()
  })

  it('shows empty state when no history', () => {
    const original = mockActiveProfile
    mockActiveProfile = { ...original, history: [] }
    renderPage()
    expect(screen.getByText('還沒有遊玩紀錄')).toBeInTheDocument()
    expect(screen.getByText('🎮 開始玩遊戲')).toBeInTheDocument()
    mockActiveProfile = original
  })

  it('clicking play button in empty state navigates to home', () => {
    const original = mockActiveProfile
    mockActiveProfile = { ...original, history: [] }
    renderPage()
    fireEvent.click(screen.getByText('🎮 開始玩遊戲'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
    mockActiveProfile = original
  })
})
