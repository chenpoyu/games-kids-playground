import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './ChineseChar.scss'

const CHINESE_DATA = [
  // Basic pictographs & common characters
  { char: '日', meaning: '太陽', emoji: '☀️', hint: '像太陽的形狀' },
  { char: '月', meaning: '月亮', emoji: '🌙', hint: '像月亮的形狀' },
  { char: '水', meaning: '水', emoji: '💧', hint: '像水流的樣子' },
  { char: '火', meaning: '火', emoji: '🔥', hint: '像火焰的樣子' },
  { char: '山', meaning: '山', emoji: '⛰️', hint: '像山的形狀' },
  { char: '木', meaning: '樹木', emoji: '🌳', hint: '像一棵樹' },
  { char: '人', meaning: '人', emoji: '🧑', hint: '像人站立的樣子' },
  { char: '口', meaning: '嘴巴', emoji: '👄', hint: '像張開的嘴巴' },
  { char: '大', meaning: '大', emoji: '🐘', hint: '人張開手腳表示大' },
  { char: '小', meaning: '小', emoji: '🐜', hint: '小小的意思' },
  { char: '上', meaning: '上面', emoji: '⬆️', hint: '方向往上' },
  { char: '下', meaning: '下面', emoji: '⬇️', hint: '方向往下' },
  { char: '土', meaning: '土地', emoji: '🟤', hint: '像地面的樣子' },
  { char: '天', meaning: '天空', emoji: '🌤️', hint: '人頭上面就是天' },
  { char: '雨', meaning: '下雨', emoji: '🌧️', hint: '像雨滴掉下來' },
  { char: '手', meaning: '手', emoji: '✋', hint: '像手的形狀' },
  { char: '目', meaning: '眼睛', emoji: '👁️', hint: '像眼睛的形狀' },
  { char: '耳', meaning: '耳朵', emoji: '👂', hint: '像耳朵的形狀' },
  { char: '田', meaning: '田地', emoji: '🌾', hint: '像農田的格子' },
  { char: '花', meaning: '花朵', emoji: '🌸', hint: '漂亮的花' },
  { char: '魚', meaning: '魚', emoji: '🐟', hint: '像魚的形狀' },
  { char: '鳥', meaning: '鳥', emoji: '🐦', hint: '像鳥的形狀' },
  { char: '馬', meaning: '馬', emoji: '🐴', hint: '像馬的形狀' },
  { char: '牛', meaning: '牛', emoji: '🐮', hint: '像牛角的樣子' },
  { char: '羊', meaning: '羊', emoji: '🐑', hint: '像羊角的樣子' },
  { char: '犬', meaning: '狗', emoji: '🐶', hint: '像狗的形狀' },
  { char: '石', meaning: '石頭', emoji: '🪨', hint: '像石頭的樣子' },
  { char: '車', meaning: '車子', emoji: '🚗', hint: '像車子的形狀' },
  { char: '門', meaning: '門', emoji: '🚪', hint: '像門的形狀' },
  { char: '女', meaning: '女生', emoji: '👧', hint: '像女生的樣子' },
  { char: '子', meaning: '小孩', emoji: '👶', hint: '像小寶寶' },
  { char: '王', meaning: '國王', emoji: '👑', hint: '國王戴皇冠' },
  { char: '米', meaning: '米飯', emoji: '🍚', hint: '像米粒的形狀' },
  { char: '風', meaning: '風', emoji: '💨', hint: '風吹過來' },
  { char: '雲', meaning: '雲朵', emoji: '☁️', hint: '像雲的形狀' },
  { char: '星', meaning: '星星', emoji: '⭐', hint: '天上的星星' },
  { char: '草', meaning: '草地', emoji: '🌿', hint: '綠色的草' },
  { char: '蟲', meaning: '蟲子', emoji: '🐛', hint: '像小蟲的樣子' },
  { char: '竹', meaning: '竹子', emoji: '🎋', hint: '像竹子的形狀' },
  { char: '果', meaning: '水果', emoji: '🍎', hint: '樹上結的果實' },
  { char: '足', meaning: '腳', emoji: '🦶', hint: '走路用的腳' },
  { char: '刀', meaning: '刀', emoji: '🔪', hint: '像一把刀' },
  { char: '力', meaning: '力氣', emoji: '💪', hint: '有力量' },
  { char: '心', meaning: '心', emoji: '❤️', hint: '像心臟的形狀' },
  { char: '舟', meaning: '小船', emoji: '🛶', hint: '像小船的形狀' },
  { char: '食', meaning: '食物', emoji: '🍱', hint: '吃的東西' },
  { char: '衣', meaning: '衣服', emoji: '👕', hint: '穿在身上的' },
]

const GAME_MODES = [
  { id: 'learn', title: '📖 認識中文字', description: '看圖學漢字' },
  { id: 'match', title: '🎯 圖文配對', description: '找出正確的字' },
  { id: 'reverse', title: '🔄 看字找圖', description: '看字選正確的意思' },
]

const LEVEL_CONFIG = {
  beginner: { label: '初級', totalQuestions: 5, charRange: 12 },
  intermediate: { label: '中級', totalQuestions: 6, charRange: 20 },
  advanced: { label: '高級', totalQuestions: 8, charRange: 30 },
  expert: { label: '專家', totalQuestions: 10, charRange: 40 },
  master: { label: '大師', totalQuestions: 12, charRange: 49 },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ChineseChar() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakDelayed } = useSpeak()
  const { recordGame } = useProfile()
  const [difficulty, setDifficulty] = useState(null)
  const [mode, setMode] = useState(null)
  const [learnIndex, setLearnIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)

  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  const totalQuestions = config?.totalQuestions || 5
  const charPool = config ? CHINESE_DATA.slice(0, config.charRange) : CHINESE_DATA

  // 追蹤已出過的題目，避免重複
  const usedMatchIndices = useRef(new Set())
  const usedReverseIndices = useRef(new Set())

  const generateMatchQuestion = useCallback(() => {
    const pool = difficulty ? CHINESE_DATA.slice(0, LEVEL_CONFIG[difficulty].charRange) : CHINESE_DATA
    let available = pool.filter((_, i) => !usedMatchIndices.current.has(i))
    if (available.length === 0) {
      usedMatchIndices.current.clear()
      available = pool
    }
    const item = available[Math.floor(Math.random() * available.length)]
    const itemIdx = pool.indexOf(item)
    usedMatchIndices.current.add(itemIdx)

    const wrongChars = shuffleArray(
      CHINESE_DATA.filter(a => a.char !== item.char)
    ).slice(0, 3).map(a => a.char)
    const choices = shuffleArray([item.char, ...wrongChars])

    setQuestion({ item, choices, type: 'match' })
    setSelectedAnswer(null)
    setIsCorrect(null)
  }, [difficulty])

  const generateReverseQuestion = useCallback(() => {
    const pool = difficulty ? CHINESE_DATA.slice(0, LEVEL_CONFIG[difficulty].charRange) : CHINESE_DATA
    let available = pool.filter((_, i) => !usedReverseIndices.current.has(i))
    if (available.length === 0) {
      usedReverseIndices.current.clear()
      available = pool
    }
    const item = available[Math.floor(Math.random() * available.length)]
    const itemIdx = pool.indexOf(item)
    usedReverseIndices.current.add(itemIdx)

    const wrongItems = shuffleArray(
      CHINESE_DATA.filter(a => a.char !== item.char)
    ).slice(0, 3)
    const choices = shuffleArray([item, ...wrongItems])

    setQuestion({ item, choices, type: 'reverse' })
    setSelectedAnswer(null)
    setIsCorrect(null)
  }, [difficulty])

  useEffect(() => {
    if (mode === 'match') generateMatchQuestion()
    if (mode === 'reverse') generateReverseQuestion()
  }, [mode, generateMatchQuestion, generateReverseQuestion])

  // 進入模式時的語音說明
  useEffect(() => {
    if (mode === 'learn') {
      speakDelayed('看圖認字，學習中文字喔！')
    } else if (mode === 'match') {
      speakDelayed('看圖片，找出正確的中文字！')
    } else if (mode === 'reverse') {
      speakDelayed('看中文字，選出正確的意思！')
    }
  }, [mode, speakDelayed])

  // 學習模式自動播報漢字
  useEffect(() => {
    if (mode !== 'learn') return
    const item = charPool[learnIndex]
    if (item) {
      setTimeout(() => speakZh(item.char + '，' + item.meaning), 300)
    }
  }, [mode, learnIndex, charPool, speakZh])

  const handleMatchAnswer = (char) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(char)

    if (char === question.item.char) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = getStars()
          recordGame('chinese-char', '簡易中文字', stars, `${config.label} · 圖文配對，答對 ${score + 1} 題`, difficulty)
          setShowWin(true)
        } else {
          setQuestionIndex(q => q + 1)
          generateMatchQuestion()
        }
      }, 1000)
    } else {
      setIsCorrect(false)
      playWrong()
      setErrors(e => e + 1)
      setTimeout(() => {
        setSelectedAnswer(null)
        setIsCorrect(null)
      }, 800)
    }
  }

  const handleReverseAnswer = (item) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(item.char)

    if (item.char === question.item.char) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = getStars()
          recordGame('chinese-char', '簡易中文字', stars, `${config.label} · 看字找圖，答對 ${score + 1} 題`, difficulty)
          setShowWin(true)
        } else {
          setQuestionIndex(q => q + 1)
          generateReverseQuestion()
        }
      }, 1000)
    } else {
      setIsCorrect(false)
      playWrong()
      setErrors(e => e + 1)
      setTimeout(() => {
        setSelectedAnswer(null)
        setIsCorrect(null)
      }, 800)
    }
  }

  const resetGame = () => {
    setMode(null)
    setLearnIndex(0)
    setQuestionIndex(0)
    setQuestion(null)
    setScore(0)
    setErrors(0)
    setShowWin(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    usedMatchIndices.current.clear()
    usedReverseIndices.current.clear()
  }

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 3) return 2
    return 1
  }

  const nextDifficulty = getNextLevel(difficulty)
  const nextDifficultyUnlocked = nextDifficulty && getStars() >= 2

  const handleNextDifficulty = () => {
    const currentMode = mode
    setDifficulty(nextDifficulty)
    // 保持當前模式，只重設遊戲狀態
    setLearnIndex(0)
    setQuestionIndex(0)
    setQuestion(null)
    setScore(0)
    setErrors(0)
    setShowWin(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    usedMatchIndices.current.clear()
    usedReverseIndices.current.clear()
    // 保持模式不變，直接進入下一難度
    setMode(currentMode)
  }

  if (!difficulty) {
    return (
      <LevelSelect
        gameId="chinese-char"
        gameName="簡易中文字"
        gameEmoji="字"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }

  // Learning mode
  if (mode === 'learn') {
    const item = charPool[learnIndex]
    return (
      <div className="chinese-char">
        <BackButton />
        <div className="chinese-char__header">
          <h1 className="chinese-char__title">📖 認識中文字</h1>
          <div className="chinese-char__level-badge">{config.label}</div>
          <p className="chinese-char__subtitle">
            第 {learnIndex + 1} / {charPool.length} 個字
          </p>
        </div>

        <div className="chinese-char__card-display">
          <div className="chinese-char__big-card">
            <div className="chinese-char__big-char">{item.char}</div>
            <div className="chinese-char__big-emoji">{item.emoji}</div>
            <div className="chinese-char__big-meaning">{item.meaning}</div>
            <div className="chinese-char__big-hint">💡 {item.hint}</div>
            <button
              className="chinese-char__speak-btn"
              onClick={() => speakZh(item.char + '，' + item.meaning)}
              title="播放語音"
            >🔊</button>
          </div>
        </div>

        <div className="chinese-char__nav">
          <button
            className="chinese-char__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.max(0, i - 1)) }}
            disabled={learnIndex === 0}
          >
            ⬅️ 上一個
          </button>
          <button
            className="chinese-char__nav-btn chinese-char__nav-btn--back"
            onClick={() => { playClick(); setMode(null) }}
          >
            📋 選單
          </button>
          <button
            className="chinese-char__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.min(charPool.length - 1, i + 1)) }}
            disabled={learnIndex === charPool.length - 1}
          >
            下一個 ➡️
          </button>
        </div>
      </div>
    )
  }

  // Match mode (see emoji → pick character)
  if (mode === 'match' && question) {
    return (
      <div className="chinese-char">
        <BackButton />
        <div className="chinese-char__header">
          <h1 className="chinese-char__title">🎯 圖文配對</h1>
          <div className="chinese-char__level-badge">{config.label}</div>
          <div className="chinese-char__stats">
            <span className="chinese-char__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="chinese-char__stat">✅ {score}</span>
          </div>
        </div>

        <div className="chinese-char__match-game">
          <div className="chinese-char__match-prompt">
            <span className="chinese-char__match-emoji">{question.item.emoji}</span>
            <span className="chinese-char__match-meaning">{question.item.meaning}</span>
            <span className="chinese-char__match-hint">哪一個字是「{question.item.meaning}」？</span>
          </div>

          <div className="chinese-char__match-choices">
            {question.choices.map((char) => (
              <button
                key={char}
                className={`chinese-char__match-btn ${
                  selectedAnswer === char
                    ? isCorrect ? 'correct' : 'wrong'
                    : ''
                } ${selectedAnswer && char === question.item.char ? 'show-correct' : ''}`}
                onClick={() => handleMatchAnswer(char)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        <WinModal
          show={showWin}
          stars={getStars()}
          message={`你答對了 ${score} 題！`}
          onReplay={() => { setQuestionIndex(0); setScore(0); setErrors(0); setShowWin(false); generateMatchQuestion() }}
          onHome={() => navigate('/')}
          onNextLevel={nextDifficultyUnlocked ? handleNextDifficulty : undefined}
          nextLevelLabel={nextDifficulty ? `挑戰${DIFFICULTY_LEVELS[nextDifficulty].label}` : undefined}
        />
      </div>
    )
  }

  // Reverse mode (see character → pick meaning/emoji)
  if (mode === 'reverse' && question) {
    return (
      <div className="chinese-char">
        <BackButton />
        <div className="chinese-char__header">
          <h1 className="chinese-char__title">🔄 看字找圖</h1>
          <div className="chinese-char__level-badge">{config.label}</div>
          <div className="chinese-char__stats">
            <span className="chinese-char__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="chinese-char__stat">✅ {score}</span>
          </div>
        </div>

        <div className="chinese-char__match-game">
          <div className="chinese-char__match-prompt">
            <span className="chinese-char__reverse-char">{question.item.char}</span>
            <span className="chinese-char__match-hint">這個字是什麼意思？</span>
          </div>

          <div className="chinese-char__match-choices">
            {question.choices.map((item) => (
              <button
                key={item.char}
                className={`chinese-char__reverse-btn ${
                  selectedAnswer === item.char
                    ? isCorrect ? 'correct' : 'wrong'
                    : ''
                } ${selectedAnswer && item.char === question.item.char ? 'show-correct' : ''}`}
                onClick={() => handleReverseAnswer(item)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                <span className="chinese-char__reverse-emoji">{item.emoji}</span>
                <span className="chinese-char__reverse-meaning">{item.meaning}</span>
              </button>
            ))}
          </div>
        </div>

        <WinModal
          show={showWin}
          stars={getStars()}
          message={`你答對了 ${score} 題！`}
          onReplay={() => { setQuestionIndex(0); setScore(0); setErrors(0); setShowWin(false); generateReverseQuestion() }}
          onHome={() => navigate('/')}
          onNextLevel={nextDifficultyUnlocked ? handleNextDifficulty : undefined}
          nextLevelLabel={nextDifficulty ? `挑戰${DIFFICULTY_LEVELS[nextDifficulty].label}` : undefined}
        />
      </div>
    )
  }

  // Menu
  return (
    <div className="chinese-char">
      <BackButton />
      <div className="chinese-char__header">
        <h1 className="chinese-char__title">📝 簡易中文字</h1>
        <div className="chinese-char__level-badge">{config.label}</div>
        <p className="chinese-char__subtitle">選擇一個學習模式</p>
      </div>

      <div className="chinese-char__menu">
        {GAME_MODES.map((gm) => (
          <button
            key={gm.id}
            className="chinese-char__menu-btn"
            onClick={() => { playClick(); setMode(gm.id) }}
          >
            <span className="chinese-char__menu-title">{gm.title}</span>
            <span className="chinese-char__menu-desc">{gm.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
