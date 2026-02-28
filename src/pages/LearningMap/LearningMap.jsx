import { useNavigate } from 'react-router-dom'
import { useProfile, AGE_GROUPS, DIFFICULTY_LEVELS, LEVEL_ORDER } from '../../contexts/ProfileContext'
import { useSound } from '../../hooks/useSound'
import ProfileBar from '../../components/ProfileBar/ProfileBar'
import './LearningMap.scss'

// 遊戲定義 — 含學習拓樸座標
const GAMES = [
  {
    id: 'color-match',
    path: '/color-match',
    emoji: '🎨',
    title: '顏色配對',
    description: '找出一樣的顏色！',
    color: '#FF6B6B',
    bgGradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
    minAge: 2,
    category: 'perception',
    mapPosition: { row: 0, col: 0 },
    connectsTo: ['animal-puzzle'],
  },
  {
    id: 'shape-sort',
    path: '/shape-sort',
    emoji: '🔷',
    title: '形狀排排看',
    description: '把形狀放對位置！',
    color: '#FB923C',
    bgGradient: 'linear-gradient(135deg, #FB923C, #FDBA74)',
    minAge: 2,
    category: 'perception',
    mapPosition: { row: 0, col: 1 },
    connectsTo: ['balloon-pop'],
  },
  {
    id: 'animal-puzzle',
    path: '/animal-puzzle',
    emoji: '🦁',
    title: '動物翻翻樂',
    description: '翻牌找一樣的動物！',
    color: '#4ECDC4',
    bgGradient: 'linear-gradient(135deg, #4ECDC4, #6EE7DE)',
    minAge: 3,
    category: 'memory',
    mapPosition: { row: 1, col: 0 },
    connectsTo: ['abc-learn'],
  },
  {
    id: 'balloon-pop',
    path: '/balloon-pop',
    emoji: '🎈',
    title: '數字氣球',
    description: '按順序戳氣球！',
    color: '#A78BFA',
    bgGradient: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
    minAge: 3,
    category: 'number',
    mapPosition: { row: 1, col: 1 },
    connectsTo: ['number-learn'],
  },
  {
    id: 'number-learn',
    path: '/number-learn',
    emoji: '🔢',
    title: '數字學習',
    description: '認識數字與數數！',
    color: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    minAge: 3,
    category: 'number',
    mapPosition: { row: 2, col: 1 },
    connectsTo: ['abc-learn'],
  },
  {
    id: 'abc-learn',
    path: '/abc-learn',
    emoji: '🔤',
    title: 'ABC 字母',
    description: '認識英文字母！',
    color: '#1976D2',
    bgGradient: 'linear-gradient(135deg, #1976D2, #42A5F5)',
    minAge: 4,
    category: 'language',
    mapPosition: { row: 2, col: 0 },
    connectsTo: ['chinese-char'],
  },
  {
    id: 'zhuyin-learn',
    path: '/zhuyin-learn',
    emoji: 'ㄅ',
    title: '注音符號',
    description: '認識ㄅㄆㄇ！',
    color: '#E65100',
    bgGradient: 'linear-gradient(135deg, #E65100, #FF8F00)',
    minAge: 4,
    category: 'language',
    mapPosition: { row: 3, col: 0 },
    connectsTo: [],
  },
  {
    id: 'math-basic',
    path: '/math-basic',
    emoji: '➕',
    title: '簡易加減法',
    description: '學習加法和減法！',
    color: '#283593',
    bgGradient: 'linear-gradient(135deg, #283593, #5C6BC0)',
    minAge: 4,
    category: 'number',
    mapPosition: { row: 3, col: 1 },
    connectsTo: [],
  },
  {
    id: 'chinese-char',
    path: '/chinese-char',
    emoji: '字',
    title: '簡易中文字',
    description: '認識基本漢字！',
    color: '#BF360C',
    bgGradient: 'linear-gradient(135deg, #BF360C, #E64A19)',
    minAge: 4,
    category: 'language',
    mapPosition: { row: 4, col: 0 },
    connectsTo: [],
  },
]

// 年齡對應建議目標級別
const AGE_TARGET_LEVEL = {
  2: { target: 'beginner', label: '初級', desc: '先認識基本顏色和形狀' },
  3: { target: 'intermediate', label: '中級', desc: '挑戰記憶和數字遊戲' },
  4: { target: 'advanced', label: '高級', desc: '嘗試字母、注音和中文字' },
  5: { target: 'expert', label: '專家', desc: '挑戰專家關卡，加強學習' },
  6: { target: 'master', label: '大師', desc: '全部大師關卡，成為學霸' },
}

export default function LearningMap() {
  const navigate = useNavigate()
  const { playClick } = useSound()
  const { activeProfile } = useProfile()

  if (!activeProfile) {
    navigate('/')
    return null
  }

  const age = activeProfile.age
  const ageGroup = AGE_GROUPS.find(g => g.age === age) || AGE_GROUPS[2]
  const unlockedGames = activeProfile.unlockedGames || []
  const levelProgress = activeProfile.levelProgress || {}

  const handleGameClick = (game) => {
    if (!unlockedGames.includes(game.id)) return
    playClick()
    navigate(game.path)
  }

  const getGameLevel = (gameId) => {
    const prog = levelProgress[gameId]
    if (!prog || !prog.bestStars) return null
    // 從最高級往下找
    for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
      if (prog.bestStars[LEVEL_ORDER[i]] >= 1) return LEVEL_ORDER[i]
    }
    return null
  }

  const getHighestStarLevel = (gameId) => {
    const prog = levelProgress[gameId]
    if (!prog || !prog.bestStars) return null
    for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
      if (prog.bestStars[LEVEL_ORDER[i]] >= 3) return LEVEL_ORDER[i]
    }
    return null
  }

  const getTotalStarsForGame = (gameId) => {
    const prog = levelProgress[gameId]
    if (!prog || !prog.bestStars) return 0
    return Object.values(prog.bestStars).reduce((sum, s) => sum + s, 0)
  }

  // 計算整體進度
  const totalPossibleStars = GAMES.length * 15 // 5 levels * 3 stars each
  const totalEarned = GAMES.reduce((sum, g) => sum + getTotalStarsForGame(g.id), 0)
  const progressPercent = Math.round((totalEarned / totalPossibleStars) * 100)

  // 年齡目標級別
  const ageTarget = AGE_TARGET_LEVEL[age] || AGE_TARGET_LEVEL[4]
  const targetLevelIdx = LEVEL_ORDER.indexOf(ageTarget.target)

  // 計算年齡目標達成率：有多少遊戲達到了目標級別
  const ageFilteredGames = GAMES.filter(g => g.minAge <= age)
  const gamesReachedTarget = ageFilteredGames.filter(g => {
    const highest = getGameLevel(g.id)
    if (!highest) return false
    return LEVEL_ORDER.indexOf(highest) >= targetLevelIdx
  }).length
  const targetPercent = ageFilteredGames.length > 0 ? Math.round((gamesReachedTarget / ageFilteredGames.length) * 100) : 0

  return (
    <div className="learning-map">
      <ProfileBar />

      {/* 頂部導航 */}
      <div className="learning-map__nav">
        <button className="learning-map__nav-btn" onClick={() => { playClick(); navigate('/') }}>
          🏠 首頁
        </button>
        <button className="learning-map__nav-btn" onClick={() => { playClick(); navigate('/history') }}>
          📚 履歷
        </button>
      </div>

      <header className="learning-map__header">
        <h1 className="learning-map__title">🗺️ 學習旅程</h1>
        <div className="learning-map__age-badge" style={{ background: ageGroup.color }}>
          {ageGroup.emoji} {ageGroup.label}
        </div>

        {/* 年齡目標卡 */}
        <div className="learning-map__age-target" style={{ borderColor: ageGroup.color }}>
          <div className="learning-map__target-header">
            <span className="learning-map__target-icon">🎯</span>
            <span className="learning-map__target-title">{age}歲學習目標</span>
          </div>
          <p className="learning-map__target-desc">{ageTarget.desc}</p>
          <div className="learning-map__target-level" style={{ background: DIFFICULTY_LEVELS[ageTarget.target].color }}>
            目標：所有遊戲達到「{ageTarget.label}」
          </div>
          <div className="learning-map__target-progress">
            <div className="learning-map__target-bar">
              <div className="learning-map__target-fill" style={{ width: `${targetPercent}%`, background: ageGroup.color }} />
            </div>
            <span className="learning-map__target-text">
              {gamesReachedTarget}/{ageFilteredGames.length} 個遊戲已達標 ({targetPercent}%)
            </span>
          </div>
        </div>

        <div className="learning-map__overall-progress">
          <div className="learning-map__progress-bar">
            <div
              className="learning-map__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="learning-map__progress-text">
            總進度 {progressPercent}% · ⭐ {totalEarned}/{totalPossibleStars}
          </span>
        </div>
      </header>

      {/* 學習拓樸地圖 */}
      <div className="learning-map__grid">
        {GAMES.map((game, index) => {
          const isUnlocked = unlockedGames.includes(game.id)
          const currentLevel = getGameLevel(game.id)
          const isAgeAppropriate = age >= game.minAge
          // 判斷此遊戲是否已達到年齡目標
          const reachedTarget = currentLevel && LEVEL_ORDER.indexOf(currentLevel) >= targetLevelIdx
          // 判斷此遊戲是否適合當前年齡
          const isRecommended = isAgeAppropriate && isUnlocked

          return (
            <div
              key={game.id}
              className="learning-map__node-wrapper"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {/* 連接線 */}
              {game.connectsTo.length > 0 && (
                <div className="learning-map__connector">
                  <span className="learning-map__connector-arrow">⬇️</span>
                </div>
              )}

              <button
                className={`map-node ${isUnlocked ? 'unlocked' : 'locked'} ${currentLevel ? `level-${currentLevel}` : ''} ${!isAgeAppropriate ? 'age-locked' : ''} ${reachedTarget ? 'target-reached' : ''}`}
                style={{ '--node-color': game.color, background: isUnlocked ? game.bgGradient : undefined }}
                onClick={() => handleGameClick(game)}
                disabled={!isUnlocked}
              >
                {!isUnlocked && (
                  <div className="map-node__lock">🔒</div>
                )}

                {reachedTarget && (
                  <div className="map-node__target-check">✅</div>
                )}

                <div className="map-node__emoji">{game.emoji}</div>
                <h3 className="map-node__title">{game.title}</h3>
                <p className="map-node__desc">{game.description}</p>

                {isUnlocked && (
                  <div className="map-node__progress">
                    <div className="map-node__stars">
                      {[1, 2, 3].map(i => (
                        <span key={i} className={i <= (levelProgress[game.id]?.bestStars?.beginner || 0) ? 'active' : ''}>
                          {i <= (levelProgress[game.id]?.bestStars?.beginner || 0) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    {currentLevel && (
                      <span className="map-node__level-badge" style={{ background: DIFFICULTY_LEVELS[currentLevel].color }}>
                        {DIFFICULTY_LEVELS[currentLevel].label}
                      </span>
                    )}
                    {isRecommended && !reachedTarget && (
                      <span className="map-node__target-hint">
                        目標：{ageTarget.label}
                      </span>
                    )}
                  </div>
                )}

                {!isUnlocked && !isAgeAppropriate && (
                  <span className="map-node__age-hint">{game.minAge}歲解鎖</span>
                )}
                {!isUnlocked && isAgeAppropriate && (
                  <span className="map-node__age-hint">完成前置關卡解鎖</span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* 年齡學習說明 */}
      <div className="learning-map__age-guide">
        <h3>📊 各年齡學習目標</h3>
        <div className="learning-map__age-list">
          {Object.entries(AGE_TARGET_LEVEL).map(([ageKey, info]) => {
            const isCurrentAge = Number(ageKey) === age
            const ageGroupInfo = AGE_GROUPS.find(g => g.age === Number(ageKey))
            return (
              <div key={ageKey} className={`learning-map__age-item ${isCurrentAge ? 'current' : ''}`}>
                <span className="learning-map__age-emoji">{ageGroupInfo?.emoji || '🌱'}</span>
                <div className="learning-map__age-info">
                  <span className="learning-map__age-label">{ageKey}歲</span>
                  <span className="learning-map__age-level" style={{ background: DIFFICULTY_LEVELS[info.target].color }}>
                    {info.label}
                  </span>
                </div>
                <span className="learning-map__age-desc">{info.desc}</span>
                {isCurrentAge && <span className="learning-map__age-current">← 你在這裡</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 學習建議 */}
      <div className="learning-map__tips">
        <h3>💡 {activeProfile.name} 的學習建議</h3>
        {age <= 2 ? (
          <p>從「顏色配對」和「形狀排排看」開始，培養基礎認知能力！目標：初級全部 ⭐⭐⭐</p>
        ) : age <= 3 ? (
          <p>試試「動物翻翻樂」和「數字氣球」，練習記憶和數數！目標：每個遊戲達到「中級」🎯</p>
        ) : age <= 4 ? (
          <p>挑戰「ABC字母」、「注音符號」和「中文字」！目標：每個遊戲達到「高級」💪</p>
        ) : age <= 5 ? (
          <p>往「專家」關卡邁進，加深所有領域的學習！目標：每個遊戲達到「專家」🔥</p>
        ) : (
          <p>挑戰「大師」關卡，讓所有遊戲都達到最高等級吧！目標：全部大師 👑</p>
        )}
      </div>
    </div>
  )
}
