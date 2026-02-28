import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ShapeSort from '../../games/ShapeSort/ShapeSort'

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
      <ShapeSort />
    </MemoryRouter>
  )
  // Games now show LevelSelect first; click '初級' to enter the game
  fireEvent.click(screen.getAllByText('初級')[0])
  return result
}

describe('ShapeSort', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders game title', () => {
    renderGame()
    expect(screen.getByText('🔷 形狀排排看')).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderGame()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders initial subtitle prompt', () => {
    renderGame()
    expect(screen.getByText('先選一個彩色形狀，再找到它的位置！')).toBeInTheDocument()
  })

  it('renders colored shapes section', () => {
    renderGame()
    expect(screen.getByText('🌈 彩色形狀')).toBeInTheDocument()
  })

  it('renders target section', () => {
    renderGame()
    expect(screen.getByText('🎯 放到正確位置')).toBeInTheDocument()
  })

  it('renders progress bar at 0/3', () => {
    renderGame()
    expect(screen.getByText('0/3')).toBeInTheDocument()
  })

  it('renders 3 shape buttons and 3 target buttons', () => {
    renderGame()
    const shapeBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('shape-btn'))
    const targetBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('target-btn'))
    expect(shapeBtns).toHaveLength(3)
    expect(targetBtns).toHaveLength(3)
  })

  it('renders shape names', () => {
    renderGame()
    // Beginner mode has 3 randomly selected shapes, so check that 3 name labels are rendered
    const nameEls = document.querySelectorAll('.shape-btn__name')
    expect(nameEls).toHaveLength(3)
    nameEls.forEach(el => {
      expect(el.textContent.length).toBeGreaterThan(0)
    })
  })

  it('selecting a shape updates subtitle', () => {
    renderGame()
    const shapeBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('shape-btn'))
    fireEvent.click(shapeBtns[0])
    // subtitle should change to show the selected shape name
    const nameEl = shapeBtns[0].querySelector('.shape-btn__name')
    const shapeName = nameEl.textContent
    expect(screen.getByText(`找到「${shapeName}」的位置！`)).toBeInTheDocument()
  })

  it('matching shape to correct target increases progress', async () => {
    vi.useFakeTimers()
    renderGame()
    const shapeBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('shape-btn'))
    const targetBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('target-btn'))

    // Get shape IDs by inspecting key attributes - shapes and targets share the same ids
    // We need to match shape-{id} to target-{id}
    // Click first shape, then find matching target
    fireEvent.click(shapeBtns[0])
    // The shape button key is like shape-circle, target key is target-circle
    // We find target with same shape by checking class/key patterns
    // Since shapes are shuffled, let's match by trying each target
    // In tests, we can just click all targets until one works
    for (const targetBtn of targetBtns) {
      fireEvent.click(targetBtn)
    }

    await act(async () => { vi.advanceTimersByTime(600) })
    // At least one match should succeed, progress should advance
    expect(screen.getByText('1/3')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('completing all matches shows win modal', async () => {
    vi.useFakeTimers()
    renderGame()

    // Strategy: for each shape, click it, then click all targets until matched
    for (let round = 0; round < 3; round++) {
      const shapeBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('shape-btn') && !btn.classList.contains('matched') && !btn.disabled
      )
      if (shapeBtns.length === 0) break
      fireEvent.click(shapeBtns[0])

      const targetBtns = screen.getAllByRole('button').filter(
        btn => btn.classList.contains('target-btn') && !btn.classList.contains('matched') && !btn.disabled
      )
      for (const targetBtn of targetBtns) {
        fireEvent.click(targetBtn)
        await act(async () => { vi.advanceTimersByTime(600) })
      }
    }

    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    vi.useRealTimers()
  })
})
