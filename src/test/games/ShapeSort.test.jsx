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
      <ShapeSort />
    </MemoryRouter>
  )
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

  it('renders progress bar at 0/6', () => {
    renderGame()
    expect(screen.getByText('0/6')).toBeInTheDocument()
  })

  it('renders 6 shape buttons and 6 target buttons', () => {
    renderGame()
    const shapeBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('shape-btn'))
    const targetBtns = screen.getAllByRole('button').filter(btn => btn.classList.contains('target-btn'))
    expect(shapeBtns).toHaveLength(6)
    expect(targetBtns).toHaveLength(6)
  })

  it('renders shape names', () => {
    renderGame()
    const shapeNames = ['圓形', '正方形', '三角形', '星形', '愛心', '菱形']
    shapeNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument()
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
    expect(screen.getByText('1/6')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('completing all matches shows win modal', async () => {
    vi.useFakeTimers()
    renderGame()

    // Strategy: for each shape, click it, then click all targets until matched
    for (let round = 0; round < 6; round++) {
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
