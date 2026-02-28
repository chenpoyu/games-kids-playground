import { useState } from 'react'
import { useProfile } from '../../contexts/ProfileContext'
import { useSound } from '../../hooks/useSound'
import './ProfileBar.scss'

export default function ProfileBar() {
  const { activeProfile, profiles, switchProfile } = useProfile()
  const { playClick } = useSound()
  const [showSwitcher, setShowSwitcher] = useState(false)

  if (!activeProfile) return null

  const otherProfiles = profiles.filter(p => p.id !== activeProfile.id)

  return (
    <div className="profile-bar">
      <button
        className="profile-bar__current"
        onClick={() => { playClick(); setShowSwitcher(!showSwitcher) }}
      >
        <span className="profile-bar__avatar">{activeProfile.avatar}</span>
        <span className="profile-bar__name">{activeProfile.name}</span>
        <span className="profile-bar__level">{activeProfile.age}歲</span>
        <span className="profile-bar__switch-icon">{showSwitcher ? '▲' : '▼'}</span>
      </button>

      {showSwitcher && (
        <div className="profile-bar__dropdown">
          {otherProfiles.map((profile) => (
            <button
              key={profile.id}
              className="profile-bar__option"
              onClick={() => {
                playClick()
                switchProfile(profile.id)
                setShowSwitcher(false)
              }}
            >
              <span className="profile-bar__option-avatar">{profile.avatar}</span>
              <span className="profile-bar__option-name">{profile.name}</span>
              <span className="profile-bar__option-age">{profile.age}歲</span>
            </button>
          ))}
          <button
            className="profile-bar__option profile-bar__option--logout"
            onClick={() => {
              playClick()
              switchProfile(null)
              setShowSwitcher(false)
            }}
          >
            🔄 切換學員
          </button>
        </div>
      )}
    </div>
  )
}
