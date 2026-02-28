import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BackButton from '../../components/BackButton/BackButton'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('BackButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders home icon and text', () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    )
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('has correct aria-label for accessibility', () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('回首頁')).toBeInTheDocument()
  })

  it('navigates to home on click', () => {
    render(
      <MemoryRouter>
        <BackButton />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByLabelText('回首頁'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
