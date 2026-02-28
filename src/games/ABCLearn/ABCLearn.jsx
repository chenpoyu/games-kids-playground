import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './ABCLearn.scss'

const ALPHABET_DATA = [
  { letter: 'A', word: 'Apple', emoji: '🍎', chinese: '蘋果' },
  { letter: 'B', word: 'Bear', emoji: '🐻', chinese: '小熊' },
  { letter: 'C', word: 'Cat', emoji: '🐱', chinese: '小貓' },
  { letter: 'D', word: 'Dog', emoji: '🐶', chinese: '小狗' },
  { letter: 'E', word: 'Elephant', emoji: '🐘', chinese: '大象' },
  { letter: 'F', word: 'Fish', emoji: '🐟', chinese: '小魚' },
  { letter: 'G', word: 'Grape', emoji: '🍇', chinese: '葡萄' },
  { letter: 'H', word: 'Hat', emoji: '🎩', chinese: '帽子' },
  { letter: 'I', word: 'Ice cream', emoji: '🍦', chinese: '冰淇淋' },
  { letter: 'J', word: 'Juice', emoji: '🧃', chinese: '果汁' },
  { letter: 'K', word: 'Kite', emoji: '🪁', chinese: '風箏' },
  { letter: 'L', word: 'Lion', emoji: '🦁', chinese: '獅子' },
  { letter: 'M', word: 'Moon', emoji: '🌙', chinese: '月亮' },
  { letter: 'N', word: 'Nut', emoji: '🥜', chinese: '堅果' },
  { letter: 'O', word: 'Orange', emoji: '🍊', chinese: '橘子' },
  { letter: 'P', word: 'Penguin', emoji: '🐧', chinese: '企鵝' },
  { letter: 'Q', word: 'Queen', emoji: '👑', chinese: '皇后' },
  { letter: 'R', word: 'Rainbow', emoji: '🌈', chinese: '彩虹' },
  { letter: 'S', word: 'Star', emoji: '⭐', chinese: '星星' },
  { letter: 'T', word: 'Tree', emoji: '🌳', chinese: '大樹' },
  { letter: 'U', word: 'Umbrella', emoji: '☂️', chinese: '雨傘' },
  { letter: 'V', word: 'Violin', emoji: '🎻', chinese: '小提琴' },
  { letter: 'W', word: 'Whale', emoji: '🐳', chinese: '鯨魚' },
  { letter: 'X', word: 'Xylophone', emoji: '🎵', chinese: '木琴' },
  { letter: 'Y', word: 'Yacht', emoji: '⛵', chinese: '帆船' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', chinese: '斑馬' },
]

const GAME_MODES = [
  { id: 'learn', title: '📖 認識字母', description: '學習 A~Z' },
  { id: 'match', title: '🎯 字母配對', description: '找出正確的字母' },
  { id: 'order', title: '🔤 字母排序', description: '按照順序排列' },
]

const LEVEL_CONFIG = {
  beginner: { label: '初級', totalQuestions: 5, letterRange: 10, orderSize: 4 },
  intermediate: { label: '中級', totalQuestions: 6, letterRange: 15, orderSize: 5 },
  advanced: { label: '高級', totalQuestions: 8, letterRange: 20, orderSize: 6 },
  expert: { label: '專家', totalQuestions: 10, letterRange: 26, orderSize: 7 },
  master: { label: '大師', totalQuestions: 12, letterRange: 26, orderSize: 8 },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ABCLearn() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakEn, speakDelayed } = useSpeak()
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
  const [orderSequence, setOrderSequence] = useState([])
  const [orderLetters, setOrderLetters] = useState([])

  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  const totalQuestions = config?.totalQuestions || 8
  const letterPool = config ? ALPHABET_DATA.slice(0, config.letterRange) : ALPHABET_DATA

  // 學習模式自動播放語音
  useEffect(() => {
    if (mode !== 'learn' || !config) return
    const pool = ALPHABET_DATA.slice(0, config.letterRange)
    const item = pool[learnIndex]
    if (item) {
      setTimeout(() => speakEn(item.word), 300)
    }
  }, [mode, learnIndex, config, speakEn])

  // 進入模式時的語音說明
  useEffect(() => {
    if (mode === 'learn') {
      speakDelayed('Let\u2019s learn the alphabet!', 'en-US')
    } else if (mode === 'match') {
      speakDelayed('找出正確的英文字母！')
    } else if (mode === 'order') {
      speakDelayed('按照順序排列字母喔！')
    }
  }, [mode, speakDelayed])

  // 追蹤已出過的題目，避免重複
  const usedMatchIndices = useRef(new Set())

  const generateMatchQuestion = useCallback(() => {
    const pool = difficulty ? ALPHABET_DATA.slice(0, LEVEL_CONFIG[difficulty].letterRange) : ALPHABET_DATA
    let available = pool.filter((_, i) => !usedMatchIndices.current.has(i))
    if (available.length === 0) {
      usedMatchIndices.current.clear()
      available = pool
    }
    const item = available[Math.floor(Math.random() * available.length)]
    const itemIdx = pool.indexOf(item)
    usedMatchIndices.current.add(itemIdx)

    const wrongLetters = shuffleArray(
      ALPHABET_DATA.filter(a => a.letter !== item.letter)
    ).slice(0, 3).map(a => a.letter)
    const choices = shuffleArray([item.letter, ...wrongLetters])

    setQuestion({
      item,
      choices,
    })
    setSelectedAnswer(null)
    setIsCorrect(null)
  }, [difficulty])

  const generateOrderGame = useCallback(() => {
    const size = config?.orderSize || 5
    const pool = difficulty ? ALPHABET_DATA.slice(0, LEVEL_CONFIG[difficulty].letterRange) : ALPHABET_DATA
    const startIdx = Math.floor(Math.random() * (pool.length - size))
    const letters = pool.slice(startIdx, startIdx + size).map(a => a.letter)
    setOrderLetters(shuffleArray([...letters]))
    setOrderSequence([])
  }, [])

  useEffect(() => {
    if (mode === 'match') generateMatchQuestion()
    if (mode === 'order') generateOrderGame()
  }, [mode, generateMatchQuestion, generateOrderGame])

  const handleMatchAnswer = (letter) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(letter)

    if (letter === question.item.letter) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = errors === 0 ? 3 : errors <= 3 ? 2 : 1
          recordGame('abc-learn', 'ABC 英文字母', stars, `${config.label} · 字母配對，答對 ${score + 1} 題`, difficulty)
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

  const handleOrderClick = (letter) => {
    if (orderSequence.includes(letter)) return
    playClick()

    // Find correct next letter
    const allLetters = [...orderLetters].sort()
    const expectedNext = allLetters[orderSequence.length]

    if (letter === expectedNext) {
      playCorrect()
      const newSeq = [...orderSequence, letter]
      setOrderSequence(newSeq)

      if (newSeq.length === orderLetters.length) {
        setScore(s => s + 1)
        setTimeout(() => {
          if (questionIndex + 1 >= totalQuestions) {
            playWin()
            const stars = errors === 0 ? 3 : errors <= 3 ? 2 : 1
            recordGame('abc-learn', 'ABC 英文字母', stars, `${config.label} · 字母排序完成，答對 ${score + 1} 題`, difficulty)
            setShowWin(true)
          } else {
            setQuestionIndex(q => q + 1)
            generateOrderGame()
          }
        }, 800)
      }
    } else {
      playWrong()
      setErrors(e => e + 1)
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
    setOrderSequence([])
    setOrderLetters([])
    usedMatchIndices.current.clear()
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
    setOrderSequence([])
    setOrderLetters([])
    usedMatchIndices.current.clear()
    // 保持模式不變，直接進入下一難度
    setMode(currentMode)
  }

  if (!difficulty) {
    return (
      <LevelSelect
        gameId="abc-learn"
        gameName="ABC 英文字母"
        gameEmoji="🔤"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }

  // Learning mode - browse alphabet cards
  if (mode === 'learn') {
    const item = letterPool[learnIndex]
    return (
      <div className="abc-learn">
        <BackButton />
        <div className="abc-learn__header">
          <h1 className="abc-learn__title">🔤 認識字母</h1>
          <div className="abc-learn__level-badge">{config.label}</div>
          <p className="abc-learn__subtitle">
            第 {learnIndex + 1} / {letterPool.length} 個字母
          </p>
        </div>

          <div className="abc-learn__card-display">
          <div className="abc-learn__big-card">
            <div className="abc-learn__big-letter">{item.letter}{item.letter.toLowerCase()}</div>
            <div className="abc-learn__big-emoji">{item.emoji}</div>
            <div className="abc-learn__big-word">
              <span className="abc-learn__english">{item.word}</span>
              <span className="abc-learn__chinese">{item.chinese}</span>
              <button
                className="abc-learn__speak-btn"
                onClick={(e) => { e.stopPropagation(); speakEn(item.word) }}
                title="播放語音"
              >
                🔊
              </button>
            </div>
          </div>
        </div>        <div className="abc-learn__nav">
          <button
            className="abc-learn__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.max(0, i - 1)) }}
            disabled={learnIndex === 0}
          >
            ⬅️ 上一個
          </button>
          <button
            className="abc-learn__nav-btn abc-learn__nav-btn--back"
            onClick={() => { playClick(); setMode(null) }}
          >
            📋 選單
          </button>
          <button
            className="abc-learn__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.min(letterPool.length - 1, i + 1)) }}
            disabled={learnIndex === letterPool.length - 1}
          >
            下一個 ➡️
          </button>
        </div>
      </div>
    )
  }

  // Game modes
  if (mode === 'match' && question) {
    return (
      <div className="abc-learn">
        <BackButton />
        <div className="abc-learn__header">
          <h1 className="abc-learn__title">🎯 字母配對</h1>
          <div className="abc-learn__level-badge">{config.label}</div>
          <div className="abc-learn__stats">
            <span className="abc-learn__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="abc-learn__stat">✅ {score}</span>
          </div>
        </div>

        <div className="abc-learn__match-game">
          <div className="abc-learn__match-prompt">
            <span className="abc-learn__match-emoji">{question.item.emoji}</span>
            <span className="abc-learn__match-word">
              {question.item.word}
              <button
                className="abc-learn__speak-btn abc-learn__speak-btn--small"
                onClick={(e) => { e.stopPropagation(); speakEn(question.item.word) }}
                title="播放語音"
              >
                🔊
              </button>
            </span>
            <span className="abc-learn__match-hint">這個字的開頭是什麼字母？</span>
          </div>

          <div className="abc-learn__match-choices">
            {question.choices.map((letter) => (
              <button
                key={letter}
                className={`abc-learn__match-btn ${
                  selectedAnswer === letter
                    ? isCorrect ? 'correct' : 'wrong'
                    : ''
                } ${selectedAnswer && letter === question.item.letter ? 'show-correct' : ''}`}
                onClick={() => handleMatchAnswer(letter)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                {letter}
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

  if (mode === 'order') {
    const sortedLetters = [...orderLetters].sort()
    return (
      <div className="abc-learn">
        <BackButton />
        <div className="abc-learn__header">
          <h1 className="abc-learn__title">🔤 字母排序</h1>
          <div className="abc-learn__level-badge">{config.label}</div>
          <div className="abc-learn__stats">
            <span className="abc-learn__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="abc-learn__stat">✅ {score}</span>
          </div>
        </div>

        <div className="abc-learn__order-game">
          <p className="abc-learn__order-prompt">按照字母順序點選！</p>
          <div className="abc-learn__order-done">
            {orderSequence.map((letter, i) => (
              <span key={i} className="abc-learn__order-num done">{letter}</span>
            ))}
            {orderSequence.length < orderLetters.length && (
              <span className="abc-learn__order-num next">?</span>
            )}
          </div>
          <div className="abc-learn__order-choices">
            {orderLetters.map((letter) => (
              <button
                key={letter}
                className={`abc-learn__order-btn ${orderSequence.includes(letter) ? 'used' : ''}`}
                onClick={() => handleOrderClick(letter)}
                disabled={orderSequence.includes(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <WinModal
          show={showWin}
          stars={getStars()}
          message={`字母排序完成！答對 ${score} 題！`}
          onReplay={() => { setQuestionIndex(0); setScore(0); setErrors(0); setShowWin(false); generateOrderGame() }}
          onHome={() => navigate('/')}
          onNextLevel={nextDifficultyUnlocked ? handleNextDifficulty : undefined}
          nextLevelLabel={nextDifficulty ? `挑戰${DIFFICULTY_LEVELS[nextDifficulty].label}` : undefined}
        />
      </div>
    )
  }

  // Menu
  return (
    <div className="abc-learn">
      <BackButton />
      <div className="abc-learn__header">
        <h1 className="abc-learn__title">🔤 ABC 英文字母</h1>
        <div className="abc-learn__level-badge">{config.label}</div>
        <p className="abc-learn__subtitle">選擇一個學習模式</p>
      </div>

      <div className="abc-learn__menu">
        {GAME_MODES.map((gm) => (
          <button
            key={gm.id}
            className="abc-learn__menu-btn"
            onClick={() => { playClick(); setMode(gm.id) }}
          >
            <span className="abc-learn__menu-title">{gm.title}</span>
            <span className="abc-learn__menu-desc">{gm.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
