import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import './ShapeSort.scss'

const ALL_SHAPES = [
  { id: 'circle', name: '圓形', color: '#FF6B6B', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <circle cx="50" cy="50" r="42" />
    </svg>
  )},
  { id: 'square', name: '正方形', color: '#60A5FA', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <rect x="12" y="12" width="76" height="76" rx="4" />
    </svg>
  )},
  { id: 'triangle', name: '三角形', color: '#34D399', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <polygon points="50,8 92,88 8,88" />
    </svg>
  )},
  { id: 'star', name: '星形', color: '#FBBF24', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <polygon points="50,5 63,35 95,35 69,57 79,90 50,70 21,90 31,57 5,35 37,35" />
    </svg>
  )},
  { id: 'heart', name: '愛心', color: '#F472B6', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <path d="M50,88 C20,65 5,50 5,32 C5,18 18,5 32,5 C40,5 46,10 50,16 C54,10 60,5 68,5 C82,5 95,18 95,32 C95,50 80,65 50,88Z" />
    </svg>
  )},
  { id: 'diamond', name: '菱形', color: '#A78BFA', svg: (
    <svg viewBox="0 0 100 100" className="shape-svg">
      <polygon points="50,5 92,50 50,95 8,50" />
    </svg>
  )},
]

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ShapeSort() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { recordGame } = useProgress()
  const [shapes, setShapes] = useState([])
  const [targets, setTargets] = useState([])
  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrongId, setWrongId] = useState(null)
  const [showWin, setShowWin] = useState(false)
  const [errors, setErrors] = useState(0)
  const puzzleCount = 6

  const initGame = useCallback(() => {
    const chosen = shuffleArray(ALL_SHAPES).slice(0, puzzleCount)
    setShapes(shuffleArray([...chosen]))
    setTargets(shuffleArray([...chosen]))
    setSelected(null)
    setMatched([])
    setWrongId(null)
    setShowWin(false)
    setErrors(0)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const handleShapeClick = (shape) => {
    if (matched.includes(shape.id)) return
    playClick()
    setSelected(shape)
    setWrongId(null)
  }

  const handleTargetClick = (target) => {
    if (!selected) return
    if (matched.includes(target.id)) return

    if (selected.id === target.id) {
      playCorrect()
      const newMatched = [...matched, target.id]
      setMatched(newMatched)
      setSelected(null)

      if (newMatched.length === puzzleCount) {
        setTimeout(() => {
          playWin()
          const stars = errors === 0 ? 3 : errors <= 3 ? 2 : 1
          recordGame('shape-sort', '形狀排排看', stars, errors === 0 ? '全部正確！' : `錯了 ${errors} 次`)
          setShowWin(true)
        }, 500)
      }
    } else {
      playWrong()
      setErrors(e => e + 1)
      setWrongId(target.id)
      setTimeout(() => setWrongId(null), 500)
    }
  }

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 3) return 2
    return 1
  }

  return (
    <div className="shape-sort">
      <BackButton />

      <div className="shape-sort__header">
        <h1 className="shape-sort__title">🔷 形狀排排看</h1>
        <p className="shape-sort__subtitle">
          {selected 
            ? `找到「${selected.name}」的位置！` 
            : '先選一個彩色形狀，再找到它的位置！'
          }
        </p>
        <div className="shape-sort__progress">
          <div className="shape-sort__progress-bar">
            <div 
              className="shape-sort__progress-fill" 
              style={{ width: `${(matched.length / puzzleCount) * 100}%` }}
            />
          </div>
          <span>{matched.length}/{puzzleCount}</span>
        </div>
      </div>

      {/* 彩色形狀 */}
      <div className="shape-sort__section">
        <h2 className="shape-sort__section-title">🌈 彩色形狀</h2>
        <div className="shape-sort__grid">
          {shapes.map((shape) => (
            <button
              key={`shape-${shape.id}`}
              className={`shape-btn ${selected?.id === shape.id ? 'selected' : ''} ${matched.includes(shape.id) ? 'matched' : ''}`}
              style={{ '--shape-color': shape.color }}
              onClick={() => handleShapeClick(shape)}
              disabled={matched.includes(shape.id)}
            >
              <div className="shape-btn__icon" style={{ fill: shape.color }}>
                {shape.svg}
              </div>
              <span className="shape-btn__name">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 目標輪廓 */}
      <div className="shape-sort__section">
        <h2 className="shape-sort__section-title">🎯 放到正確位置</h2>
        <div className="shape-sort__grid">
          {targets.map((target) => (
            <button
              key={`target-${target.id}`}
              className={`target-btn ${matched.includes(target.id) ? 'matched' : ''} ${wrongId === target.id ? 'wrong' : ''} ${selected ? 'ready' : ''}`}
              style={{ '--shape-color': target.color }}
              onClick={() => handleTargetClick(target)}
              disabled={matched.includes(target.id)}
            >
              <div className={`target-btn__icon ${matched.includes(target.id) ? 'filled' : ''}`}
                   style={{ fill: matched.includes(target.id) ? target.color : 'none', stroke: matched.includes(target.id) ? target.color : '#B0BEC5' }}>
                {target.svg}
              </div>
            </button>
          ))}
        </div>
      </div>

      <WinModal
        show={showWin}
        stars={getStars()}
        message={errors === 0 ? '太厲害了！全部都對！' : `只錯了 ${errors} 次，好棒！`}
        onReplay={initGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
