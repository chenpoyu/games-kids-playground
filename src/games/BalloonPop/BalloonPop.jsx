import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import './BalloonPop.scss'

const BALLOON_COLORS = [
  '#FF6B6B', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA',
  '#FB923C', '#F472B6', '#22D3EE', '#4ECDC4', '#E879F9',
]

// Use grid-based positions to prevent overlap
function generateBalloons(count = 7) {
  // Create a grid of possible positions that won't overlap
  const positions = []
  const cols = 3
  const rows = 3
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: 12 + c * 30 + (Math.random() * 14 - 7),  // spread within cell, with jitter
        y: 8 + r * 28 + (Math.random() * 10 - 5),
      })
    }
  }
  // Shuffle positions and pick `count` of them
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]]
  }

  const balloons = []
  for (let i = 1; i <= count; i++) {
    const pos = positions[i - 1]
    balloons.push({
      id: i,
      number: i,
      color: BALLOON_COLORS[(i - 1) % BALLOON_COLORS.length],
      x: Math.max(8, Math.min(82, pos.x)),
      y: Math.max(5, Math.min(75, pos.y)),
      size: 0.9 + Math.random() * 0.2,
      delay: Math.random() * 0.5,
      popped: false,
    })
  }
  return balloons
}

export default function BalloonPop() {
  const navigate = useNavigate()
  const { playPop, playWrong, playWin } = useSound()
  const { recordGame } = useProgress()
  const [balloons, setBalloons] = useState(() => generateBalloons(7))
  const [nextNumber, setNextNumber] = useState(1)
  const [showWin, setShowWin] = useState(false)
  const [errors, setErrors] = useState(0)
  const [poppedCount, setPoppedCount] = useState(0)
  const [wrongBalloon, setWrongBalloon] = useState(null)
  const totalBalloons = 7

  const handleBalloonClick = useCallback((balloon) => {
    if (balloon.popped) return

    if (balloon.number === nextNumber) {
      // 正確！戳破氣球
      playPop()
      setBalloons(prev => prev.map(b => 
        b.id === balloon.id ? { ...b, popped: true } : b
      ))
      setNextNumber(n => n + 1)
      setPoppedCount(c => c + 1)

      if (nextNumber === totalBalloons) {
        setTimeout(() => {
          playWin()
          const stars = errors === 0 ? 3 : errors <= 3 ? 2 : 1
          recordGame('balloon-pop', '數字氣球', stars, errors === 0 ? '零失誤！' : `錯了 ${errors} 次`)
          setShowWin(true)
        }, 600)
      }
    } else {
      // 錯誤！
      playWrong()
      setErrors(e => e + 1)
      setWrongBalloon(balloon.id)
      setTimeout(() => setWrongBalloon(null), 500)
    }
  }, [nextNumber, playPop, playWrong, playWin, totalBalloons])

  const resetGame = () => {
    setBalloons(generateBalloons(7))
    setNextNumber(1)
    setShowWin(false)
    setErrors(0)
    setPoppedCount(0)
    setWrongBalloon(null)
  }

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 3) return 2
    return 1
  }

  return (
    <div className="balloon-pop">
      <BackButton />

      <div className="balloon-pop__header">
        <h1 className="balloon-pop__title">🎈 數字氣球</h1>
        <p className="balloon-pop__subtitle">
          按照 <strong>1, 2, 3...</strong> 的順序戳氣球！
        </p>
        <div className="balloon-pop__hint">
          <span className="balloon-pop__next">
            下一個：<strong>{nextNumber > totalBalloons ? '🎉' : nextNumber}</strong>
          </span>
          <span className="balloon-pop__count">
            ✅ {poppedCount}/{totalBalloons}
          </span>
        </div>
      </div>

      <div className="balloon-pop__sky">
        {/* 背景雲朵 */}
        <div className="balloon-pop__cloud" style={{ top: '10%', left: '5%', animationDelay: '0s' }}>☁️</div>
        <div className="balloon-pop__cloud" style={{ top: '20%', right: '10%', animationDelay: '-5s' }}>☁️</div>
        <div className="balloon-pop__cloud" style={{ top: '60%', left: '70%', animationDelay: '-10s' }}>☁️</div>

        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            className={`balloon ${balloon.popped ? 'popped' : ''} ${wrongBalloon === balloon.id ? 'wrong' : ''}`}
            style={{
              left: `${balloon.x}%`,
              top: `${balloon.y}%`,
              '--balloon-color': balloon.color,
              '--balloon-size': balloon.size,
              animationDelay: `${balloon.delay}s`,
            }}
            onClick={() => handleBalloonClick(balloon)}
            disabled={balloon.popped}
          >
            {!balloon.popped && (
              <>
                <div className="balloon__body">
                  <span className="balloon__number">{balloon.number}</span>
                  <div className="balloon__shine" />
                </div>
                <div className="balloon__string" />
              </>
            )}
            {balloon.popped && (
              <span className="balloon__pop-effect">💥</span>
            )}
          </button>
        ))}
      </div>

      <WinModal
        show={showWin}
        stars={getStars()}
        message={errors === 0 ? '完美！你知道 1 到 7 的順序！' : `你只犯了 ${errors} 個小錯誤！`}
        onReplay={resetGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
