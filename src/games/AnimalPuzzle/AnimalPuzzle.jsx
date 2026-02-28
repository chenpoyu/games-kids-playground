import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './AnimalPuzzle.scss'

const ALL_ANIMALS = [
  { id: 'cat', emoji: '🐱', name: '小貓', english: 'Cat' },
  { id: 'dog', emoji: '🐶', name: '小狗', english: 'Dog' },
  { id: 'rabbit', emoji: '🐰', name: '兔子', english: 'Rabbit' },
  { id: 'bear', emoji: '🐻', name: '小熊', english: 'Bear' },
  { id: 'lion', emoji: '🦁', name: '獅子', english: 'Lion' },
  { id: 'elephant', emoji: '🐘', name: '大象', english: 'Elephant' },
  { id: 'panda', emoji: '🐼', name: '熊貓', english: 'Panda' },
  { id: 'monkey', emoji: '🐵', name: '猴子', english: 'Monkey' },
  { id: 'pig', emoji: '🐷', name: '小豬', english: 'Pig' },
  { id: 'frog', emoji: '🐸', name: '青蛙', english: 'Frog' },
  { id: 'duck', emoji: '🦆', name: '鴨子', english: 'Duck' },
  { id: 'penguin', emoji: '🐧', name: '企鹝', english: 'Penguin' },
]

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateCards(pairCount = 6) {
  const selected = shuffleArray(ALL_ANIMALS).slice(0, pairCount)
  const pairs = [...selected, ...selected].map((item, index) => ({
    ...item,
    cardId: index,
    matched: false,
  }))
  return shuffleArray(pairs)
}

const LEVEL_CONFIG = {
  beginner: { pairCount: 3, label: '初級' },
  intermediate: { pairCount: 4, label: '中級' },
  advanced: { pairCount: 6, label: '高級' },
  expert: { pairCount: 8, label: '專家' },
  master: { pairCount: 10, label: '大師' },
}

export default function AnimalPuzzle() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakEn, speakDelayed } = useSpeak()
  const { recordGame } = useProfile()
  const [level, setLevel] = useState(null)
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matches, setMatches] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [lastMatched, setLastMatched] = useState(null)

  const config = level ? LEVEL_CONFIG[level] : null
  const totalPairs = config?.pairCount || 6

  useEffect(() => {
    if (level) {
      const cfg = LEVEL_CONFIG[level]
      setCards(generateCards(cfg.pairCount))
      setFlipped([])
      setMatches(0)
      setAttempts(0)
      setShowWin(false)
      setDisabled(false)
      setLastMatched(null)
    }
  }, [level])

  // 進入關卡時的語音說明
  useEffect(() => {
    if (level) {
      speakDelayed('翻開卡片，找出兩隻一樣的動物配對喔！')
    }
  }, [level, speakDelayed])

  const handleCardClick = useCallback((cardId) => {
    if (disabled) return
    const card = cards.find(c => c.cardId === cardId)
    if (!card || card.matched || flipped.includes(cardId)) return

    playClick()
    // 翻牌時播報動物名稱（中文 + 英文）
    speakZh(card.name)
    setTimeout(() => speakEn(card.english), 800)
    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setDisabled(true)
      setAttempts(a => a + 1)
      const [first, second] = newFlipped
      const card1 = cards.find(c => c.cardId === first)
      const card2 = cards.find(c => c.cardId === second)

      if (card1.id === card2.id) {
        setTimeout(() => {
          playCorrect()
          setLastMatched(card1.id)
          setCards(prev => prev.map(c =>
            c.id === card1.id ? { ...c, matched: true } : c
          ))
          setMatches(m => m + 1)
          setFlipped([])
          setDisabled(false)
          setTimeout(() => setLastMatched(null), 800)
        }, 600)
      } else {
        setTimeout(() => {
          playWrong()
          setFlipped([])
          setDisabled(false)
        }, 1000)
      }
    }
  }, [cards, flipped, disabled, playClick, playCorrect, playWrong, speakZh, speakEn])

  useEffect(() => {
    if (level && matches === totalPairs && matches > 0) {
      setTimeout(() => {
        playWin()
        const stars = attempts <= totalPairs + 3 ? 3 : attempts <= totalPairs * 2 ? 2 : 1
        recordGame('animal-puzzle', '動物翻翻樂', stars, `${config.label} · 翻了 ${attempts} 次`, level)
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
      setLastMatched(null)
    }
  }

  const getStars = () => {
    if (attempts <= totalPairs + 3) return 3
    if (attempts <= totalPairs * 2) return 2
    return 1
  }

  const nextLevelKey = getNextLevel(level)
  const nextLevelUnlocked = nextLevelKey && getStars() >= 2

  const handleNextLevel = () => {
    setLevel(nextLevelKey)
    setShowWin(false)
  }

  if (!level) {
    return (
      <LevelSelect
        gameId="animal-puzzle"
        gameName="動物翻翻樂"
        gameEmoji="🦁"
        onSelectLevel={setLevel}
        onBack={() => navigate('/')}
      />
    )
  }

  return (
    <div className="animal-puzzle">
      <BackButton />

      <div className="animal-puzzle__header">
        <h1 className="animal-puzzle__title">🦁 動物記憶翻翻樂</h1>
        <div className="animal-puzzle__level-badge">{config.label}</div>
        <p className="animal-puzzle__subtitle">
          翻開卡片，找出兩隻一樣的動物！
        </p>
        <div className="animal-puzzle__stats">
          <span className="animal-puzzle__stat">
            🐾 找到 {matches}/{totalPairs} 對
          </span>
          <span className="animal-puzzle__stat">
            👆 翻了 {attempts} 次
          </span>
        </div>
      </div>

      <div className="animal-puzzle__grid">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.cardId) || card.matched
          return (
            <button
              key={card.cardId}
              className={`animal-card ${isFlipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${lastMatched === card.id ? 'just-matched' : ''}`}
              onClick={() => handleCardClick(card.cardId)}
              disabled={card.matched}
            >
              <div className="animal-card__inner">
                <div className="animal-card__front">
                  <span className="animal-card__question">🌿</span>
                </div>
                <div className="animal-card__back">
                  <span className="animal-card__emoji">{card.emoji}</span>
                  <span className="animal-card__name">{card.name}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="animal-puzzle__tip">
        💡 記住每張卡片的位置，就能更快找到一樣的動物喔！
      </div>

      <WinModal
        show={showWin}
        stars={getStars()}
        message={`你翻了 ${attempts} 次就找到所有動物了！`}
        onReplay={resetGame}
        onHome={() => navigate('/')}
        onNextLevel={nextLevelUnlocked ? handleNextLevel : undefined}
        nextLevelLabel={nextLevelKey ? `挑戰${DIFFICULTY_LEVELS[nextLevelKey].label}` : undefined}
      />
    </div>
  )
}
