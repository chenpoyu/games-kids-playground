import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './ColorMatch.scss'

const COLORS = [
  { name: '紅色', english: 'Red', color: '#FF6B6B', emoji: '🍎' },
  { name: '藍色', english: 'Blue', color: '#60A5FA', emoji: '🫐' },
  { name: '綠色', english: 'Green', color: '#34D399', emoji: '🥒' },
  { name: '黃色', english: 'Yellow', color: '#FBBF24', emoji: '🌟' },
  { name: '紫色', english: 'Purple', color: '#A78BFA', emoji: '🍇' },
  { name: '橘色', english: 'Orange', color: '#FB923C', emoji: '🍊' },
  { name: '粉紅', english: 'Pink', color: '#F472B6', emoji: '🌸' },
  { name: '青色', english: 'Cyan', color: '#22D3EE', emoji: '💎' },
]

// 根據難度決定配對數量
const LEVEL_CONFIG = {
  beginner: { pairCount: 3, label: '初級' },
  intermediate: { pairCount: 4, label: '中級' },
  advanced: { pairCount: 5, label: '高級' },
  expert: { pairCount: 6, label: '專家' },
  master: { pairCount: 8, label: '大師' },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateCards(pairCount = 4) {
  const selected = shuffleArray(COLORS).slice(0, pairCount)
  const pairs = [...selected, ...selected].map((item, index) => ({
    ...item,
    id: index,
    matched: false,
  }))
  return shuffleArray(pairs)
}

export default function ColorMatch() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakEn, speakDelayed } = useSpeak()
  const { recordGame } = useProfile()
  const [level, setLevel] = useState(null) // null = 選擇級別
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const config = level ? LEVEL_CONFIG[level] : null
  const totalPairs = config?.pairCount || 4

  // 選擇級別後初始化
  useEffect(() => {
    if (level) {
      const cfg = LEVEL_CONFIG[level]
      setCards(generateCards(cfg.pairCount))
      setFlipped([])
      setMatches(0)
      setAttempts(0)
      setShowWin(false)
      setDisabled(false)
    }
  }, [level])

  // 進入關卡時的語音說明
  useEffect(() => {
    if (level) {
      speakDelayed('翻開卡片，找出兩張一樣顏色的卡片配對喔！')
    }
  }, [level, speakDelayed])

  const handleCardClick = useCallback((id) => {
    if (disabled) return
    const card = cards.find(c => c.id === id)
    if (!card || card.matched || flipped.includes(id)) return

    playClick()
    // 翻牌時播報顏色名稱（中文 + 英文）
    speakZh(card.name)
    setTimeout(() => speakEn(card.english), 800)
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setDisabled(true)
      setAttempts(a => a + 1)
      const [first, second] = newFlipped
      const card1 = cards.find(c => c.id === first)
      const card2 = cards.find(c => c.id === second)

      if (card1.name === card2.name) {
        setTimeout(() => {
          playCorrect()
          setCards(prev => prev.map(c => 
            c.name === card1.name ? { ...c, matched: true } : c
          ))
          setMatches(m => m + 1)
          setFlipped([])
          setDisabled(false)
        }, 500)
      } else {
        setTimeout(() => {
          playWrong()
          setFlipped([])
          setDisabled(false)
        }, 800)
      }
    }
  }, [cards, flipped, disabled, playClick, playCorrect, playWrong, speakZh, speakEn])

  useEffect(() => {
    if (level && matches === totalPairs && matches > 0) {
      setTimeout(() => {
        playWin()
        const stars = attempts <= totalPairs + 3 ? 3 : attempts <= totalPairs * 2 ? 2 : 1
        recordGame('color-match', '顏色配對', stars, `${config.label} · 翻了 ${attempts} 次`, level)
        setShowWin(true)
      }, 600)
    }
  }, [matches, totalPairs, level])

  const resetGame = () => {
    if (level) {
      setCards(generateCards(LEVEL_CONFIG[level].pairCount))
      setFlipped([])
      setMatches(0)
      setAttempts(0)
      setShowWin(false)
      setDisabled(false)
    }
  }

  const getStars = () => {
    if (attempts <= totalPairs + 3) return 3
    if (attempts <= totalPairs * 2) return 2
    return 1
  }

  const nextLevel = getNextLevel(level)
  const nextLevelUnlocked = nextLevel && getStars() >= 2

  const handleNextLevel = () => {
    setLevel(nextLevel)
    setShowWin(false)
  }

  // 級別選擇畫面
  if (!level) {
    return (
      <LevelSelect
        gameId="color-match"
        gameName="顏色配對"
        gameEmoji="🎨"
        onSelectLevel={setLevel}
        onBack={() => navigate('/')}
      />
    )
  }

  return (
    <div className="color-match">
      <BackButton />

      <div className="color-match__header">
        <h1 className="color-match__title">🎨 顏色配對</h1>
        <div className="color-match__level-badge">{config.label}</div>
        <p className="color-match__subtitle">翻開卡片，找出一樣的顏色！</p>
        <div className="color-match__stats">
          <span className="color-match__stat">
            ✅ {matches}/{totalPairs}
          </span>
          <span className="color-match__stat">
            👆 翻了 {attempts} 次
          </span>
        </div>
      </div>

      <div className="color-match__grid">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched
          return (
            <button
              key={card.id}
              className={`color-card ${isFlipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched}
            >
              <div className="color-card__inner">
                <div className="color-card__front">
                  <span>❓</span>
                </div>
                <div 
                  className="color-card__back"
                  style={{ background: card.color }}
                >
                  <span className="color-card__emoji">{card.emoji}</span>
                  <span className="color-card__name">{card.name}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <WinModal
        show={showWin}
        stars={getStars()}
        message={`${config.label}通關！你用了 ${attempts} 次就找到全部了！`}
        onReplay={resetGame}
        onHome={() => navigate('/')}
        onNextLevel={nextLevelUnlocked ? handleNextLevel : undefined}
        nextLevelLabel={nextLevel ? `挑戰${DIFFICULTY_LEVELS[nextLevel].label}` : undefined}
      />
    </div>
  )
}
