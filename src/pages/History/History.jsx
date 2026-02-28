import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress, ACHIEVEMENTS } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import './History.scss'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hour}:${min}`
}

function getStarsDisplay(stars) {
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
}

export default function History() {
  const navigate = useNavigate()
  const { playClick } = useSound()
  const { progress, resetProgress } = useProgress()

  const handleReset = () => {
    if (window.confirm('確定要清除所有紀錄嗎？這個動作無法復原！')) {
      playClick()
      resetProgress()
    }
  }

  return (
    <div className="history">
      <BackButton />

      <div className="history__header">
        <h1 className="history__title">📚 學習履歷</h1>
        <p className="history__subtitle">看看你的學習成果吧！</p>
      </div>

      {/* 總覽統計 */}
      <div className="history__overview">
        <div className="history__stat-card">
          <span className="history__stat-icon">⭐</span>
          <span className="history__stat-value">{progress.totalStars}</span>
          <span className="history__stat-label">總星星數</span>
        </div>
        <div className="history__stat-card">
          <span className="history__stat-icon">🎮</span>
          <span className="history__stat-value">{progress.gamesPlayed}</span>
          <span className="history__stat-label">遊戲次數</span>
        </div>
        <div className="history__stat-card">
          <span className="history__stat-icon">🏆</span>
          <span className="history__stat-value">{progress.achievements.length}</span>
          <span className="history__stat-label">成就數量</span>
        </div>
      </div>

      {/* 成就區 */}
      <section className="history__section">
        <h2 className="history__section-title">🏅 成就</h2>
        <div className="history__achievements">
          {Object.entries(ACHIEVEMENTS).map(([key, ach]) => {
            const unlocked = progress.achievements.includes(key)
            return (
              <div key={key} className={`history__achievement ${unlocked ? 'unlocked' : 'locked'}`}>
                <span className="history__achievement-emoji">
                  {unlocked ? ach.emoji : '🔒'}
                </span>
                <div className="history__achievement-info">
                  <span className="history__achievement-title">{ach.title}</span>
                  <span className="history__achievement-desc">{ach.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 歷史紀錄 */}
      <section className="history__section">
        <h2 className="history__section-title">📝 遊玩紀錄</h2>
        {progress.history.length === 0 ? (
          <div className="history__empty">
            <p>還沒有遊玩紀錄</p>
            <button className="history__play-btn" onClick={() => { playClick(); navigate('/') }}>
              🎮 開始玩遊戲
            </button>
          </div>
        ) : (
          <div className="history__list">
            {progress.history.slice(0, 30).map((entry) => (
              <div key={entry.id} className="history__entry">
                <div className="history__entry-left">
                  <span className="history__entry-name">{entry.gameName}</span>
                  <span className="history__entry-date">{formatDate(entry.date)}</span>
                </div>
                <div className="history__entry-right">
                  <span className="history__entry-stars">{getStarsDisplay(entry.stars)}</span>
                  {entry.details && (
                    <span className="history__entry-details">{entry.details}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="history__actions">
        <button className="history__reset-btn" onClick={handleReset}>
          🗑️ 清除紀錄
        </button>
      </div>
    </div>
  )
}
