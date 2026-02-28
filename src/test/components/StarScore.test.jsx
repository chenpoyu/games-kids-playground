import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StarScore from '../../components/StarScore/StarScore'

describe('StarScore', () => {
  it('renders correct number of total stars', () => {
    render(<StarScore current={2} total={3} />)
    const stars = screen.getAllByText(/⭐|⚝/)
    expect(stars).toHaveLength(3)
  })

  it('renders filled stars based on current score', () => {
    render(<StarScore current={2} total={3} />)
    const filled = screen.getAllByText('⭐')
    expect(filled).toHaveLength(2)
  })

  it('renders empty stars for remaining', () => {
    render(<StarScore current={1} total={3} />)
    const empty = screen.getAllByText('⚝')
    expect(empty).toHaveLength(2)
  })

  it('renders all filled when current equals total', () => {
    render(<StarScore current={3} total={3} />)
    const filled = screen.getAllByText('⭐')
    expect(filled).toHaveLength(3)
    expect(screen.queryAllByText('⚝')).toHaveLength(0)
  })

  it('renders all empty when current is 0', () => {
    render(<StarScore current={0} total={3} />)
    const empty = screen.getAllByText('⚝')
    expect(empty).toHaveLength(3)
    expect(screen.queryAllByText('⭐')).toHaveLength(0)
  })

  it('displays the label text', () => {
    render(<StarScore current={1} total={3} />)
    expect(screen.getByText('得分')).toBeInTheDocument()
  })
})
