import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSound } from '../../hooks/useSound'
import { useProfile, AGE_GROUPS } from '../../contexts/ProfileContext'
import ProfileBar from '../../components/ProfileBar/ProfileBar'
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
    minAge: 2,
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
    minAge: 2,
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
    minAge: 3,
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
    minAge: 3,
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
    minAge: 3,
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
    minAge: 4,
    category: 'learn',
  },
  {
    id: 'zhuyin-learn',
    path: '/zhuyin-learn',
    emoji: 'ㄅ',
    title: '注音符號',
    description: '認識ㄅㄆㄇ！',
    color: '#E65100',
    bgGradient: 'linear-gradient(135deg, #E65100, #FF8F00)',
    minAge: 4,
    category: 'learn',
  },
  {
    id: 'math-basic',
    path: '/math-basic',
    emoji: '➕',
    title: '簡易加減法',
    description: '學習加法和減法！',
    color: '#283593',
    bgGradient: 'linear-gradient(135deg, #283593, #5C6BC0)',
    minAge: 4,
    category: 'learn',
  },
  {
    id: 'chinese-char',
    path: '/chinese-char',
    emoji: '字',
    title: '簡易中文字',
    description: '認識基本漢字！',
    color: '#BF360C',
    bgGradient: 'linear-gradient(135deg, #BF360C, #E64A19)',
    minAge: 4,
    category: 'learn',
  },
]

const DECORATIONS = ['☁️', '⭐', '🌈', '🦋', '🌸', '🎵', '💫', '🌻']

export default function Home() {
  const navigate = useNavigate()
  const { playClick } = useSound()
  const { activeProfile } = useProfile()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!activeProfile) return null

  const age = activeProfile.age
  const ageGroup = AGE_GROUPS.find(g => g.age === age) || AGE_GROUPS[2]
  const unlockedGames = activeProfile.unlockedGames || []
  const levelProgress = activeProfile.levelProgress || {}

  const handleGameClick = (path) => {
    playClick()
    navigate(path)
  }

  // 根據年齡篩選適合的遊戲
  const ageFilteredGames = GAMES.filter(g => g.minAge <= age)
  const gamesList = ageFilteredGames.filter(g => g.category === 'game')
  const learnList = ageFilteredGames.filter(g => g.category === 'learn')

  const totalStars = activeProfile.totalStars
  const gamesPlayed = activeProfile.gamesPlayed
  const achievements = activeProfile.achievements || []

  // 推薦下一個要玩的遊戲
  const getNextRecommendation = () => {
    for (const game of ageFilteredGames) {
      if (!unlockedGames.includes(game.id)) continue
      const prog = levelProgress[game.id]
      if (!prog || !prog.bestStars?.beginner) {
        return { game, level: '初級', action: '開始' }
      }
      if (prog.bestStars.beginner < 3) {
        return { game, level: '初級', action: '挑戰3星' }
      }
      if (prog.intermediateUnlocked && (!prog.bestStars.intermediate || prog.bestStars.intermediate < 3)) {
        return { game, level: '中級', action: '挑戰' }
      }
      if (prog.advancedUnlocked && (!prog.bestStars.advanced || prog.bestStars.advanced < 3)) {
        return { game, level: '高級', action: '挑戰' }
      }
    }
    return null
  }

  const recommendation = getNextRecommendation()

  return (
    <div className="home">
      <ProfileBar />

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
        <p className="home__subtitle">
          🌟 {activeProfile.avatar} {activeProfile.name}，歡迎回來！🌟
        </p>
        <div className="home__age-tag" style={{ background: ageGroup.color }}>
          {ageGroup.emoji} {ageGroup.label}
        </div>
      </header>

      {/* 積分總覽 */}
      <div className={`home__progress ${loaded ? 'loaded' : ''}`}>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">⭐</span>
          <span className="home__progress-value">{totalStars}</span>
          <span className="home__progress-label">星星</span>
        </div>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">🎮</span>
          <span className="home__progress-value">{gamesPlayed}</span>
          <span className="home__progress-label">遊戲</span>
        </div>
        <div className="home__progress-item" onClick={() => handleGameClick('/history')}>
          <span className="home__progress-icon">🏆</span>
          <span className="home__progress-value">{achievements.length}</span>
          <span className="home__progress-label">成就</span>
        </div>
      </div>

      {/* 推薦下一關 */}
      {recommendation && (
        <div className={`home__recommendation ${loaded ? 'loaded' : ''}`}>
          <div className="home__rec-label">📍 下一關推薦</div>
          <button
            className="home__rec-card"
            style={{ background: recommendation.game.bgGradient }}
            onClick={() => handleGameClick(recommendation.game.path)}
          >
            <span className="home__rec-emoji">{recommendation.game.emoji}</span>
            <div className="home__rec-info">
              <span className="home__rec-title">{recommendation.game.title}</span>
              <span className="home__rec-level">{recommendation.level} · {recommendation.action}</span>
            </div>
            <span className="home__rec-arrow">▶</span>
          </button>
        </div>
      )}

      {/* 遊戲區 */}
      <section className="home__section">
        <h2 className="home__section-title">🎯 趣味遊戲</h2>
        <div className="home__games">
          {gamesList.map((game, index) => {
            const isUnlocked = unlockedGames.includes(game.id)
            const prog = levelProgress[game.id]
            const bestBeginner = prog?.bestStars?.beginner || 0

            return (
              <button
                key={game.id}
                className={`game-card ${loaded ? 'loaded' : ''} ${!isUnlocked ? 'game-card--locked' : ''}`}
                style={{
                  animationDelay: `${0.2 + index * 0.15}s`,
                  '--card-color': game.color,
                }}
                onClick={() => isUnlocked && handleGameClick(game.path)}
                disabled={!isUnlocked}
              >
                <div className="game-card__bg" style={{ background: isUnlocked ? game.bgGradient : 'linear-gradient(135deg, #ccc, #aaa)' }} />
                <div className="game-card__content">
                  {!isUnlocked && <div className="game-card__lock">🔒</div>}
                  <div className="game-card__emoji">{game.emoji}</div>
                  <h2 className="game-card__title">{game.title}</h2>
                  <p className="game-card__desc">{game.description}</p>
                  {isUnlocked && bestBeginner > 0 && (
                    <div className="game-card__stars-display">
                      {'⭐'.repeat(bestBeginner)}{'☆'.repeat(3 - bestBeginner)}
                    </div>
                  )}
                  {!isUnlocked && (
                    <span className="game-card__unlock-text">🔒 完成前置解鎖</span>
                  )}
                </div>
                <div className="game-card__shine" />
              </button>
            )
          })}
        </div>
      </section>

      {/* 學習區 */}
      {learnList.length > 0 && (
        <section className="home__section">
          <h2 className="home__section-title">📖 學習專區</h2>
          <div className="home__games home__games--learn">
            {learnList.map((game, index) => {
              const isUnlocked = unlockedGames.includes(game.id)
              const prog = levelProgress[game.id]
              const bestBeginner = prog?.bestStars?.beginner || 0

              return (
                <button
                  key={game.id}
                  className={`game-card game-card--learn ${loaded ? 'loaded' : ''} ${!isUnlocked ? 'game-card--locked' : ''}`}
                  style={{
                    animationDelay: `${0.6 + index * 0.15}s`,
                    '--card-color': game.color,
                  }}
                  onClick={() => isUnlocked && handleGameClick(game.path)}
                  disabled={!isUnlocked}
                >
                  <div className="game-card__bg" style={{ background: isUnlocked ? game.bgGradient : 'linear-gradient(135deg, #ccc, #aaa)' }} />
                  <div className="game-card__content">
                    {!isUnlocked && <div className="game-card__lock">🔒</div>}
                    <div className="game-card__emoji">{game.emoji}</div>
                    <h2 className="game-card__title">{game.title}</h2>
                    <p className="game-card__desc">{game.description}</p>
                    {isUnlocked && bestBeginner > 0 && (
                      <div className="game-card__stars-display">
                        {'⭐'.repeat(bestBeginner)}{'☆'.repeat(3 - bestBeginner)}
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="game-card__unlock-text">🔒 完成前置解鎖</span>
                    )}
                  </div>
                  <div className="game-card__shine" />
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* 功能連結 */}
      <div className="home__links">
        <button className="home__link-btn" onClick={() => handleGameClick('/learning-map')}>
          🗺️ 學習旅程
        </button>
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
