import { useState } from 'react'
import { useProfile, AGE_GROUPS } from '../../contexts/ProfileContext'
import { useSound } from '../../hooks/useSound'
import './ProfileSelect.scss'

const AVATARS = ['🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🧒🏽', '👦🏽', '👧🏽', '🐰', '🐻', '🦁', '🐼', '🦄', '🐸']

export default function ProfileSelect() {
  const { profiles, createProfile, switchProfile, deleteProfile } = useProfile()
  const { playClick, playCorrect } = useSound()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('🧒')
  const [newAge, setNewAge] = useState(4)

  const handleCreate = () => {
    if (!newName.trim()) return
    playCorrect()
    createProfile(newName.trim(), newAvatar, newAge)
    setShowCreate(false)
    setNewName('')
    setNewAvatar('🧒')
    setNewAge(4)
  }

  const handleSelect = (id) => {
    playClick()
    switchProfile(id)
  }

  const handleDelete = (e, id, name) => {
    e.stopPropagation()
    if (window.confirm(`確定要刪除「${name}」的學習護照嗎？`)) {
      playClick()
      deleteProfile(id)
    }
  }

  const ageGroup = AGE_GROUPS.find(g => g.age === newAge) || AGE_GROUPS[2]

  return (
    <div className="profile-select">
      <div className="profile-select__bg">
        <div className="profile-select__stars">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="profile-select__star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${0.8 + Math.random() * 1.2}rem`,
            }}>✨</span>
          ))}
        </div>
      </div>

      <div className="profile-select__content">
        <div className="profile-select__header">
          <div className="profile-select__logo">🎒</div>
          <h1 className="profile-select__title">學習護照</h1>
          <p className="profile-select__subtitle">選擇你的學習護照，開始冒險吧！</p>
        </div>

        {/* 已有的學員列表 */}
        {profiles.length > 0 && (
          <div className="profile-select__list">
            {profiles.map((profile) => {
              const age = AGE_GROUPS.find(g => g.age === profile.age) || AGE_GROUPS[2]
              return (
                <button
                  key={profile.id}
                  className="profile-card"
                  onClick={() => handleSelect(profile.id)}
                >
                  <div className="profile-card__avatar">{profile.avatar}</div>
                  <div className="profile-card__info">
                    <span className="profile-card__name">{profile.name}</span>
                    <span className="profile-card__age" style={{ background: age.color }}>
                      {age.emoji} {profile.age}歲
                    </span>
                    <div className="profile-card__stats">
                      <span>⭐ {profile.totalStars}</span>
                      <span>🎮 {profile.gamesPlayed}</span>
                    </div>
                  </div>
                  <button
                    className="profile-card__delete"
                    onClick={(e) => handleDelete(e, profile.id, profile.name)}
                    title="刪除"
                  >✕</button>
                </button>
              )
            })}
          </div>
        )}

        {/* 新增學員按鈕 */}
        {!showCreate ? (
          <button
            className="profile-select__add-btn"
            onClick={() => { playClick(); setShowCreate(true) }}
          >
            <span className="profile-select__add-icon">➕</span>
            <span>建立新的學習護照</span>
          </button>
        ) : (
          <div className="profile-create">
            <h2 className="profile-create__title">📝 建立學習護照</h2>

            {/* 選擇大頭貼 */}
            <div className="profile-create__section">
              <label className="profile-create__label">選擇大頭貼</label>
              <div className="profile-create__avatars">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    className={`profile-create__avatar-btn ${newAvatar === avatar ? 'active' : ''}`}
                    onClick={() => { playClick(); setNewAvatar(avatar) }}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* 輸入名字 */}
            <div className="profile-create__section">
              <label className="profile-create__label">寶貝的名字</label>
              <input
                className="profile-create__input"
                type="text"
                placeholder="輸入名字..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={10}
                autoFocus
              />
            </div>

            {/* 選擇年齡 */}
            <div className="profile-create__section">
              <label className="profile-create__label">年齡</label>
              <div className="profile-create__ages">
                {AGE_GROUPS.map((group) => (
                  <button
                    key={group.age}
                    className={`profile-create__age-btn ${newAge === group.age ? 'active' : ''}`}
                    style={{ '--age-color': group.color }}
                    onClick={() => { playClick(); setNewAge(group.age) }}
                  >
                    <span className="profile-create__age-emoji">{group.emoji}</span>
                    <span className="profile-create__age-num">{group.age}歲</span>
                  </button>
                ))}
              </div>
              <div className="profile-create__age-info" style={{ borderColor: ageGroup.color }}>
                <strong>{ageGroup.label}</strong>
                <p>{ageGroup.description}</p>
              </div>
            </div>

            <div className="profile-create__actions">
              <button
                className="profile-create__btn profile-create__btn--cancel"
                onClick={() => { playClick(); setShowCreate(false) }}
              >
                取消
              </button>
              <button
                className="profile-create__btn profile-create__btn--confirm"
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                🎒 建立護照
              </button>
            </div>
          </div>
        )}

        {profiles.length === 0 && !showCreate && (
          <p className="profile-select__hint">
            👆 點擊上方按鈕，為孩子建立學習護照
          </p>
        )}
      </div>
    </div>
  )
}
