import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import WinModal from '../../components/WinModal/WinModal'

describe('WinModal', () => {
  it('does not render when show is false', () => {
    render(<WinModal show={false} />)
    expect(screen.queryByText('恭喜過關！')).not.toBeInTheDocument()
  })

  it('renders when show is true', () => {
    render(<WinModal show={true} />)
    expect(screen.getByText('恭喜過關！')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('displays custom message', () => {
    render(<WinModal show={true} message="太厲害了！" />)
    expect(screen.getByText('太厲害了！')).toBeInTheDocument()
  })

  it('displays default message', () => {
    render(<WinModal show={true} />)
    expect(screen.getByText('你好棒！')).toBeInTheDocument()
  })

  it('renders correct number of active stars', () => {
    render(<WinModal show={true} stars={2} />)
    const activeStars = screen.getAllByText('⭐')
    expect(activeStars).toHaveLength(2)
  })

  it('calls onReplay when replay button is clicked', () => {
    const onReplay = vi.fn()
    render(<WinModal show={true} onReplay={onReplay} />)
    fireEvent.click(screen.getByText('🔄 再玩一次'))
    expect(onReplay).toHaveBeenCalledTimes(1)
  })

  it('calls onHome when home button is clicked', () => {
    const onHome = vi.fn()
    render(<WinModal show={true} onHome={onHome} />)
    fireEvent.click(screen.getByText('🏠 回首頁'))
    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('renders all 3 stars when stars=3', () => {
    render(<WinModal show={true} stars={3} />)
    const activeStars = screen.getAllByText('⭐')
    expect(activeStars).toHaveLength(3)
    expect(screen.queryAllByText('☆')).toHaveLength(0)
  })
})
