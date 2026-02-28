import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import './ColorMatch.scss'

const COLORS = [
  { name: '紅色', color: '#FF6B6B', emoji: '🍎' },
  { name: '藍色', color: '#60A5FA', emoji: '🫐' },
  { name: '綠色', color: '#34D399', emoji: '🥒' },
  { name: '黃色', color: '#FBBF24', emoji: '🌟' },
  { name: '紫色', color: '#A78BFA', emoji: '🍇' },
  { name: '橘色', color: '#FB923C', emoji: '🍊' },
]

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
  const { recordGame } = useProgress()
  const [cards, setCards] = useState(() => generateCards(4))
  const [flipped, setFlipped] = useState([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const totalPairs = 4

  const handleCardClick = useCallback((id) => {
    if (disabled) return
    const card = cards.find(c => c.id === id)
    if (!card || card.matched || flipped.includes(id)) return

    playClick()
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setDisabled(true)
      setAttempts(a => a + 1)
      const [first, second] = newFlipped
      const card1 = cards.find(c => c.id === first)
      const card2 = cards.find(c => c.id === second)

      if (card1.name === card2.name) {
        // 配對成功！
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
        // 配對失敗
        setTimeout(() => {
          playWrong()
          setFlipped([])
          setDisabled(false)
        }, 800)
      }
    }
  }, [cards, flipped, disabled, playClick, playCorrect, playWrong])

  useEffect(() => {
    if (matches === totalPairs) {
      setTimeout(() => {
        playWin()
        const stars = attempts <= totalPairs + 2 ? 3 : attempts <= totalPairs + 5 ? 2 : 1
        recordGame('color-match', '顏色配對', stars, `翻了 ${attempts} 次`)
        setShowWin(true)
      }, 600)
    }
  }, [matches, playWin, attempts, recordGame])

  const resetGame = () => {
    setCards(generateCards(4))
    setFlipped([])
    setMatches(0)
    setAttempts(0)
    setShowWin(false)
    setDisabled(false)
  }

  const getStars = () => {
    if (attempts <= totalPairs + 2) return 3
    if (attempts <= totalPairs + 5) return 2
    return 1
  }

  return (
    <div className="color-match">
      <BackButton />

      <div className="color-match__header">
        <h1 className="color-match__title">🎨 顏色配對</h1>
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
        message={`你用了 ${attempts} 次就找到全部了！`}
        onReplay={resetGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
