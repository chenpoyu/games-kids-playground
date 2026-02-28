import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

vi.mock('../contexts/ProfileContext', () => ({
  ProfileProvider: ({ children }) => children,
  useProfile: () => ({
    activeProfile: { id: '1', name: '小明', age: 5, avatar: '🐶', totalStars: 0, gamesPlayed: 0, achievements: [], history: [], unlockedGames: ['color-match', 'animal-puzzle', 'balloon-pop', 'shape-sort', 'number-learn', 'abc-learn'], levelProgress: {} },
    profiles: [],
    switchProfile: vi.fn(),
    recordGame: vi.fn(),
    resetProgress: vi.fn(),
  }),
  AGE_GROUPS: [{ age: 5, label: '5歲', emoji: '🐶' }],
  DIFFICULTY_LEVELS: { beginner: { label: '初級', color: '#4CAF50' } },
  LEVEL_ORDER: ['beginner'],
  ACHIEVEMENTS: {},
  getNextLevel: () => null,
}))

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
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
  })

  it('renders AnimalPuzzle game', () => {
    render(
      <MemoryRouter initialEntries={['/animal-puzzle']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
  })

  it('renders BalloonPop game', () => {
    render(
      <MemoryRouter initialEntries={['/balloon-pop']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
  })

  it('renders ShapeSort game', () => {
    render(
      <MemoryRouter initialEntries={['/shape-sort']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
  })

  it('renders NumberLearn game', () => {
    render(
      <MemoryRouter initialEntries={['/number-learn']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
  })

  it('renders ABCLearn game', () => {
    render(
      <MemoryRouter initialEntries={['/abc-learn']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('選擇挑戰級別')).toBeInTheDocument()
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
