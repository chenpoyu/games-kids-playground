import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import './WinModal.scss'

export default function WinModal({ show, stars = 3, message = '你好棒！', onReplay, onHome, onNextLevel, nextLevelLabel }) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    if (show) {
      setVisible(true)
      // 放煙火！
      const duration = 2000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#60A5FA']
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#60A5FA']
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    } else {
      setVisible(false)
    }
  }, [show])

  if (!visible) return null

  return (
    <div className="win-modal-overlay">
      <div className="win-modal">
        <div className="win-modal__trophy">🏆</div>
        <h2 className="win-modal__title">恭喜過關！</h2>
        <div className="win-modal__stars">
          {[1, 2, 3].map(i => (
            <span key={i} className={`win-modal__star ${i <= stars ? 'active' : ''}`}>
              {i <= stars ? '⭐' : '☆'}
            </span>
          ))}
        </div>
        <p className="win-modal__message">{message}</p>
        <div className="win-modal__actions">
          {onNextLevel && (
            <button className="win-modal__btn win-modal__btn--next" onClick={onNextLevel}>
              🚀 {nextLevelLabel || '下一關'}
            </button>
          )}
          <button className="win-modal__btn win-modal__btn--replay" onClick={onReplay}>
            🔄 再玩一次
          </button>
          <button className="win-modal__btn win-modal__btn--home" onClick={onHome}>
            🏠 回首頁
          </button>
        </div>
      </div>
    </div>
  )
}
