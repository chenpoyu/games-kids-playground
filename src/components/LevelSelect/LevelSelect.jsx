import { useProfile, DIFFICULTY_LEVELS, LEVEL_ORDER } from '../../contexts/ProfileContext'
import { useSound } from '../../hooks/useSound'
import './LevelSelect.scss'

export default function LevelSelect({ gameId, gameName, gameEmoji, onSelectLevel, onBack }) {
  const { activeProfile } = useProfile()
  const { playClick } = useSound()

  const levelProgress = activeProfile?.levelProgress?.[gameId] || {}
  const levels = Object.entries(DIFFICULTY_LEVELS)

  const isUnlocked = (levelKey) => {
    if (levelKey === 'beginner') return true
    const unlockKey = `${levelKey}Unlocked`
    return !!levelProgress[unlockKey]
  }

  const getBestStars = (levelKey) => {
    return levelProgress.bestStars?.[levelKey] || 0
  }

  const getPlayCount = (levelKey) => {
    return levelProgress[levelKey] || 0
  }

  const getUnlockHint = (levelKey) => {
    const idx = LEVEL_ORDER.indexOf(levelKey)
    if (idx <= 0) return ''
    const prevLevel = LEVEL_ORDER[idx - 1]
    const prevLabel = DIFFICULTY_LEVELS[prevLevel].label
    return `${prevLabel}拿到2星解鎖`
  }

  return (
    <div className="level-select">
      <button className="level-select__back" onClick={onBack}>
        ← 返回
      </button>

      <div className="level-select__header">
        <div className="level-select__emoji">{gameEmoji}</div>
        <h1 className="level-select__title">{gameName}</h1>
        <p className="level-select__subtitle">選擇挑戰級別</p>
      </div>

      <div className="level-select__levels">
        {levels.map(([key, level], index) => {
          const unlocked = isUnlocked(key)
          const bestStars = getBestStars(key)
          const playCount = getPlayCount(key)

          return (
            <button
              key={key}
              className={`level-card ${unlocked ? 'unlocked' : 'locked'} ${bestStars === 3 ? 'perfect' : ''}`}
              style={{ 
                '--level-color': level.color,
                animationDelay: `${index * 0.15}s`,
              }}
              onClick={() => {
                if (!unlocked) return
                playClick()
                onSelectLevel(key)
              }}
              disabled={!unlocked}
            >
              {!unlocked && <div className="level-card__lock">🔒</div>}
              <div className="level-card__badge" style={{ background: level.color }}>
                {level.label}
              </div>
              <div className="level-card__icon">
                {unlocked ? level.emoji : '🔒'}
              </div>
              <h3 className="level-card__name">{level.label}</h3>
              <p className="level-card__desc">{level.description}</p>
              
              {unlocked && (
                <div className="level-card__progress">
                  <div className="level-card__stars">
                    {[1, 2, 3].map(i => (
                      <span key={i} className={`level-card__star ${i <= bestStars ? 'active' : ''}`}>
                        {i <= bestStars ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  {playCount > 0 && (
                    <span className="level-card__count">已玩 {playCount} 次</span>
                  )}
                </div>
              )}

              {!unlocked && (
                <p className="level-card__unlock-hint">
                  {getUnlockHint(key)}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
