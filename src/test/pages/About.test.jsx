import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from '../../pages/About/About'

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

function renderPage() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  )
}

describe('About', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders hero title', () => {
    renderPage()
    expect(screen.getByText('歡樂小遊戲樂園')).toBeInTheDocument()
  })

  it('renders hero subtitle', () => {
    renderPage()
    expect(screen.getByText(/專為 2~6 歲學齡前兒童/)).toBeInTheDocument()
  })

  it('renders hero description', () => {
    renderPage()
    expect(screen.getByText(/結合遊戲與學習/)).toBeInTheDocument()
  })

  it('renders back button', () => {
    renderPage()
    expect(screen.getByText('回首頁')).toBeInTheDocument()
  })

  it('renders features section', () => {
    renderPage()
    expect(screen.getByText('✨ 平台特色')).toBeInTheDocument()
  })

  it('renders all 6 feature cards', () => {
    renderPage()
    const featureCards = document.querySelectorAll('.about__feature-card')
    expect(featureCards).toHaveLength(6)
    expect(screen.getByText('趣味遊戲')).toBeInTheDocument()
    expect(screen.getAllByText('數字學習').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('英文字母').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('記憶訓練')).toBeInTheDocument()
    expect(screen.getByText('星星積分')).toBeInTheDocument()
    expect(screen.getByText('學習履歷')).toBeInTheDocument()
  })

  it('renders games list section', () => {
    renderPage()
    expect(screen.getByText('🎯 遊戲一覽')).toBeInTheDocument()
  })

  it('renders all 6 game items', () => {
    renderPage()
    const gameItems = document.querySelectorAll('.about__game-item')
    expect(gameItems).toHaveLength(6)
    expect(screen.getByText('顏色配對')).toBeInTheDocument()
    expect(screen.getByText('動物記憶翻翻樂')).toBeInTheDocument()
    expect(screen.getByText('數字氣球')).toBeInTheDocument()
    expect(screen.getByText('形狀排排看')).toBeInTheDocument()
    expect(screen.getAllByText('數字學習').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('ABC 英文字母')).toBeInTheDocument()
  })

  it('renders usage guide section', () => {
    renderPage()
    expect(screen.getByText('📖 使用說明')).toBeInTheDocument()
    expect(screen.getByText('在首頁選擇想玩的遊戲')).toBeInTheDocument()
    expect(screen.getByText('按照遊戲提示完成挑戰')).toBeInTheDocument()
    expect(screen.getByText('過關後獲得 1~3 顆星星')).toBeInTheDocument()
    expect(screen.getByText('到「學習履歷」查看進度和成就')).toBeInTheDocument()
  })

  it('renders guide step numbers', () => {
    renderPage()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders parent info section', () => {
    renderPage()
    expect(screen.getByText(/家長須知/)).toBeInTheDocument()
    expect(screen.getByText(/完全免費且無廣告/)).toBeInTheDocument()
    expect(screen.getByText(/支援手機、平板、電腦/)).toBeInTheDocument()
    expect(screen.getByText(/內建音效回饋/)).toBeInTheDocument()
    expect(screen.getByText(/學習紀錄保存在裝置上/)).toBeInTheDocument()
    expect(screen.getByText(/建議每次遊玩 15~20 分鐘/)).toBeInTheDocument()
  })

  it('renders CTA button', () => {
    renderPage()
    expect(screen.getByText('🎮 開始玩遊戲！')).toBeInTheDocument()
  })

  it('CTA button navigates to home', () => {
    renderPage()
    fireEvent.click(screen.getByText('🎮 開始玩遊戲！'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders footer', () => {
    renderPage()
    expect(screen.getByText(/讓學習充滿歡笑/)).toBeInTheDocument()
    expect(screen.getByText('適合 2~6 歲兒童')).toBeInTheDocument()
    expect(screen.getByText('© 2026 Poyu.Chen')).toBeInTheDocument()
  })
})
