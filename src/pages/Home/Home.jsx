import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import './Home.scss'

const GAMES = [
  {
    id: 'color-match',
    path: '/color-match',
    emoji: '🎨',
    title: '顏色配對',
    description: '找出一樣的顏色！',
    color: '#FF6B6B',
    bgGradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
    age: '2+',
    category: 'game',
  },
  {
    id: 'animal-puzzle',
    path: '/animal-puzzle',
    emoji: '🦁',
    title: '動物翻翻樂',
    description: '翻牌找一樣的動物！',
    color: '#4ECDC4',
    bgGradient: 'linear-gradient(135deg, #4ECDC4, #6EE7DE)',
    age: '3+',
    category: 'game',
  },
  {
    id: 'balloon-pop',
    path: '/balloon-pop',
    emoji: '🎈',
    title: '數字氣球',
    description: '按順序戳氣球！',
    color: '#A78BFA',
    bgGradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
    age: '3+',
    category: 'game',
  },
  {
    id: 'shape-sort',
    path: '/shape-sort',
    emoji: '🔷',
    title: '形狀排排看',
    description: '把形狀放對位置！',
    color: '#FB923C',
    bgGradient: 'linear-gradient(135deg, #FB923C, #FDBA74)',
    age: '2+',
    category: 'game',
  },
  {
    id: 'number-learn',
    path: '/number-learn',
    emoji: '🔢',
    title: '數字學習',
    description: '認識數字與數數！',
    color: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    age: '3+',
    category: 'learn',
  },
  {
    id: 'abc-learn',
    path: '/abc-learn',
    emoji: '🔤',
    title: 'ABC 字母',
    description: '認識英文字母！',
    color: '#1976D2',
    bgGradient: 'linear-gradient(135deg, #1976D2, #42A5F5)',
    age: '4+',
    category: 'learn',
  },
]

// 背景裝飾元素
const DECORATIONS = ['☁️', '⭐', '🌈', '🦋', '🌸', '🎵', '💫', '🌻']

export default function Home() {
  const navigate = useNavigate()
  const { playClick } = useSound()
  const { progress } = useProgress()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  const handleGameClick = (path) => {
    playClick()
    navigate(path)
  }

  return (
    <div className="home">
      {/* 浮動背景裝飾 */}
      <div className="home__decorations">
        {DECORATIONS.map((deco, i) => (
          <span
            key={i}
            className="home__deco-item"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${5 + (i * 17) % 70}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`,
              fontSize: `${1.5 + (i % 3) * 0.5}rem`,
            }}
          >
            {deco}
          </span>
        ))}
      </div>

      {/* 雲朵 */}
      <div className="home__clouds">
        <div className="home__cloud home__cloud--1">☁️</div>
        <div className="home__cloud home__cloud--2">☁️</div>
        <div className="home__cloud home__cloud--3">☁️</div>
      </div>

      {/* 標題區 */}
      <header className={`home__header ${loaded ? 'loaded' : ''}`}>
        <div className="home__logo">🎮</div>
        <h1 className="home__title">
          <span className="home__title-char" style={{ color: '#FF6B6B' }}>歡</span>
          <span className="home__title-char" style={{ color: '#FB923C' }}>樂</span>
          <span className="home__title-char" style={{ color: '#FFE66D' }}>小</span>
          <span className="home__title-char" style={{ color: '#4ECDC4' }}>遊</span>
          <span className="home__title-char" style={{ color: '#60A5FA' }}>戲</span>
          <span className="home__title-char" style={{ color: '#A78BFA' }}>樂</span>
          <span className="home__title-char" style={{ color: '#F472B6' }}>園</span>
        </h1>
        <p className="home__subtitle">🌟 和小動物們一起玩遊戲、學新東西！🌟</p>
      </header>

      {/* 積分總覽 */}
      <div className={`home__progress ${loaded ? 'loaded' : ''}`}>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">⭐</span>
          <span className="home__progress-value">{progress.totalStars}</span>
          <span className="home__progress-label">星星</span>
        </div>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">🎮</span>
          <span className="home__progress-value">{progress.gamesPlayed}</span>
          <span className="home__progress-label">遊戲</span>
        </div>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">🏆</span>
          <span className="home__progress-value">{progress.achievements.length}</span>
          <span className="home__progress-label">成就</span>
        </div>
      </div>

      {/* 遊戲區 */}
      <section className="home__section">
        <h2 className="home__section-title">🎯 趣味遊戲</h2>
        <div className="home__games">
          {GAMES.filter(g => g.category === 'game').map((game, index) => (
            <button
              key={game.id}
              className={`game-card ${loaded ? 'loaded' : ''}`}
              style={{
                animationDelay: `${0.2 + index * 0.15}s`,
                '--card-color': game.color,
              }}
              onClick={() => handleGameClick(game.path)}
            >
              <div className="game-card__bg" style={{ background: game.bgGradient }} />
              <div className="game-card__content">
                <div className="game-card__emoji">{game.emoji}</div>
                <h2 className="game-card__title">{game.title}</h2>
                <p className="game-card__desc">{game.description}</p>
                <span className="game-card__age">{game.age} 歲</span>
              </div>
              <div className="game-card__shine" />
            </button>
          ))}
        </div>
      </section>

      {/* 學習區 */}
      <section className="home__section">
        <h2 className="home__section-title">📖 學習專區</h2>
        <div className="home__games home__games--learn">
          {GAMES.filter(g => g.category === 'learn').map((game, index) => (
            <button
              key={game.id}
              className={`game-card game-card--learn ${loaded ? 'loaded' : ''}`}
              style={{
                animationDelay: `${0.6 + index * 0.15}s`,
                '--card-color': game.color,
              }}
              onClick={() => handleGameClick(game.path)}
            >
              <div className="game-card__bg" style={{ background: game.bgGradient }} />
              <div className="game-card__content">
                <div className="game-card__emoji">{game.emoji}</div>
                <h2 className="game-card__title">{game.title}</h2>
                <p className="game-card__desc">{game.description}</p>
                <span className="game-card__age">{game.age} 歲</span>
              </div>
              <div className="game-card__shine" />
            </button>
          ))}
        </div>
      </section>

      {/* 功能連結 */}
      <div className="home__links">
        <button className="home__link-btn" onClick={() => handleGameClick('/history')}>
          📚 學習履歷
        </button>
        <button className="home__link-btn" onClick={() => handleGameClick('/about')}>
          ℹ️ 關於我們
        </button>
      </div>

      {/* 底部裝飾 */}
      <footer className="home__footer">
        <div className="home__grass"></div>
        <span>🌱🌷🌱🌻🌱🌸🌱🌺🌱🌷🌱🌻🌱🌸🌱</span>
        <p className="home__footer-dev">© 2026 Poyu.Chen</p>
      </footer>
    </div>
  )
}
