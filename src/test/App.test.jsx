import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('App Routing', () => {
  it('renders Home page on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    // Home page has the main title characters
    expect(screen.getByText('歡')).toBeInTheDocument()
    expect(screen.getByText('園')).toBeInTheDocument()
    expect(screen.getByText('🎯 趣味遊戲')).toBeInTheDocument()
  })

  it('renders ColorMatch game', () => {
    render(
      <MemoryRouter initialEntries={['/color-match']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders AnimalPuzzle game', () => {
    render(
      <MemoryRouter initialEntries={['/animal-puzzle']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders BalloonPop game', () => {
    render(
      <MemoryRouter initialEntries={['/balloon-pop']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders ShapeSort game', () => {
    render(
      <MemoryRouter initialEntries={['/shape-sort']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders NumberLearn game', () => {
    render(
      <MemoryRouter initialEntries={['/number-learn']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders ABCLearn game', () => {
    render(
      <MemoryRouter initialEntries={['/abc-learn']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders History page', () => {
    render(
      <MemoryRouter initialEntries={['/history']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders About page', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('歡樂小遊戲樂園')).toBeInTheDocument()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })
})
