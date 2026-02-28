import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
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
  const { recordGame } = useProgress()
  const [mode, setMode] = useState(null) // null = menu, 'learn', 'match', 'order'
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

  const totalQuestions = 8

  const generateMatchQuestion = useCallback(() => {
    const item = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)]
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
  }, [])

  const generateOrderGame = useCallback(() => {
    // Pick 5 consecutive letters
    const startIdx = Math.floor(Math.random() * (ALPHABET_DATA.length - 5))
    const letters = ALPHABET_DATA.slice(startIdx, startIdx + 5).map(a => a.letter)
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
          recordGame('abc-learn', 'ABC 英文字母', stars, `字母配對，答對 ${score + 1} 題`)
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
            recordGame('abc-learn', 'ABC 英文字母', stars, `字母排序完成，答對 ${score + 1} 題`)
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
  }

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 3) return 2
    return 1
  }

  // Learning mode - browse alphabet cards
  if (mode === 'learn') {
    const item = ALPHABET_DATA[learnIndex]
    return (
      <div className="abc-learn">
        <BackButton />
        <div className="abc-learn__header">
          <h1 className="abc-learn__title">🔤 認識字母</h1>
          <p className="abc-learn__subtitle">
            第 {learnIndex + 1} / {ALPHABET_DATA.length} 個字母
          </p>
        </div>

        <div className="abc-learn__card-display">
          <div className="abc-learn__big-card">
            <div className="abc-learn__big-letter">{item.letter}{item.letter.toLowerCase()}</div>
            <div className="abc-learn__big-emoji">{item.emoji}</div>
            <div className="abc-learn__big-word">
              <span className="abc-learn__english">{item.word}</span>
              <span className="abc-learn__chinese">{item.chinese}</span>
            </div>
          </div>
        </div>

        <div className="abc-learn__nav">
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
            onClick={() => { playClick(); setLearnIndex(i => Math.min(ALPHABET_DATA.length - 1, i + 1)) }}
            disabled={learnIndex === ALPHABET_DATA.length - 1}
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
          <div className="abc-learn__stats">
            <span className="abc-learn__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="abc-learn__stat">✅ {score}</span>
          </div>
        </div>

        <div className="abc-learn__match-game">
          <div className="abc-learn__match-prompt">
            <span className="abc-learn__match-emoji">{question.item.emoji}</span>
            <span className="abc-learn__match-word">{question.item.word}</span>
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
