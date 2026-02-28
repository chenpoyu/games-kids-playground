import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './MathBasic.scss'

const LEVEL_CONFIG = {
  beginner: {
    label: '初級',
    totalQuestions: 5,
    maxNum: 5,
    ops: ['+'],
    description: '5 以內的加法',
  },
  intermediate: {
    label: '中級',
    totalQuestions: 6,
    maxNum: 10,
    ops: ['+'],
    description: '10 以內的加法',
  },
  advanced: {
    label: '高級',
    totalQuestions: 8,
    maxNum: 10,
    ops: ['+', '-'],
    description: '10 以內的加減法',
  },
  expert: {
    label: '專家',
    totalQuestions: 10,
    maxNum: 20,
    ops: ['+', '-'],
    description: '20 以內的加減法',
  },
  master: {
    label: '大師',
    totalQuestions: 12,
    maxNum: 50,
    ops: ['+', '-'],
    description: '50 以內的加減法',
  },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateQuestion(config) {
  const op = config.ops[Math.floor(Math.random() * config.ops.length)]
  let a, b, answer

  if (op === '+') {
    a = Math.floor(Math.random() * config.maxNum) + 1
    b = Math.floor(Math.random() * (config.maxNum - a)) + 0
    answer = a + b
  } else {
    // subtraction: ensure a >= b so answer >= 0
    a = Math.floor(Math.random() * config.maxNum) + 1
    b = Math.floor(Math.random() * a) + 0
    answer = a - b
  }

  // Generate wrong answers (unique, nearby)
  const choices = new Set([answer])
  const candidates = []
  for (let i = Math.max(0, answer - 4); i <= answer + 4; i++) {
    if (i !== answer && i >= 0) candidates.push(i)
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const c of candidates) {
    if (choices.size >= 4) break
    choices.add(c)
  }

  // Pick fun emoji for visual aid (small numbers only)
  const emojis = ['🍎', '🌟', '🐟', '🦋', '🍒', '🌸', '🎈', '🍬']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]

  return {
    a,
    b,
    op,
    answer,
    emoji,
    showVisual: a <= 10 && b <= 10, // only show visual for small numbers
    choices: shuffleArray([...choices]),
    text: `${a} ${op === '+' ? '＋' : '－'} ${b} ＝ ？`,
  }
}

export default function MathBasic() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakDelayed } = useSpeak()
  const { recordGame } = useProfile()
  const [difficulty, setDifficulty] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)

  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  const totalQuestions = config?.totalQuestions || 5

  // 追蹤已出過的題目，避免重複
  const usedQuestions = useRef(new Set())

  const newQuestion = useCallback(() => {
    if (!config) return
    let q
    let attempts = 0
    do {
      q = generateQuestion(config)
      attempts++
    } while (usedQuestions.current.has(`${q.a}${q.op}${q.b}`) && attempts < 20)
    usedQuestions.current.add(`${q.a}${q.op}${q.b}`)
    setQuestion(q)
    setSelectedAnswer(null)
    setIsCorrect(null)
    // 播報題目
    const opText = q.op === '+' ? '加' : '減'
    setTimeout(() => speakZh(`${q.a} ${opText} ${q.b} 等於多少？`), 400)
  }, [config, speakZh])

  useEffect(() => {
    newQuestion()
  }, [newQuestion])

  // 進入關卡時的語音說明
  useEffect(() => {
    if (!config) return
    const ops = config.ops
    if (ops.includes('+') && ops.includes('-')) {
      speakDelayed('算算看，答案是多少呢？加法和減法都有喔！')
    } else {
      speakDelayed('算算看，答案是多少呢？')
    }
  }, [config, speakDelayed])

  const handleAnswer = (answer) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(answer)

    if (answer === question.answer) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = getStars()
          recordGame('math-basic', '簡易加減法', stars, `${config.label} · 答對 ${score + 1} / ${totalQuestions} 題`, difficulty)
          setShowWin(true)
        } else {
          setQuestionIndex(q => q + 1)
          newQuestion()
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
    setQuestionIndex(0)
    setScore(0)
    setErrors(0)
    setShowWin(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    usedQuestions.current.clear()
  }

  const getStars = () => {
    if (errors === 0) return 3
    if (errors <= 2) return 2
    return 1
  }

  const nextDifficulty = getNextLevel(difficulty)
  const nextDifficultyUnlocked = nextDifficulty && getStars() >= 2

  const handleNextDifficulty = () => {
    setDifficulty(nextDifficulty)
    resetGame()
  }

  if (!difficulty) {
    return (
      <LevelSelect
        gameId="math-basic"
        gameName="簡易加減法"
        gameEmoji="➕"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }

  return (
    <div className="math-basic">
      <BackButton />

      <div className="math-basic__header">
        <h1 className="math-basic__title">➕ 簡易加減法</h1>
        <div className="math-basic__level-badge">{config.label}</div>
        <p className="math-basic__description">{config.description}</p>
        <div className="math-basic__stats">
          <span className="math-basic__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
          <span className="math-basic__stat">✅ {score}</span>
        </div>
      </div>

      {question && (
        <div className="math-basic__game">
          {/* Visual aid with emoji */}
          {question.showVisual && (
            <div className="math-basic__visual">
              <div className="math-basic__visual-group">
                {Array(question.a).fill(question.emoji).map((e, i) => (
                  <span key={`a-${i}`} className="math-basic__visual-item">{e}</span>
                ))}
              </div>
              <span className="math-basic__visual-op">
                {question.op === '+' ? '＋' : '－'}
              </span>
              <div className="math-basic__visual-group">
                {Array(question.b).fill(question.emoji).map((e, i) => (
                  <span key={`b-${i}`} className={`math-basic__visual-item ${question.op === '-' ? 'subtract' : ''}`}>{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Question */}
          <div className="math-basic__question">
            <span className="math-basic__question-text">{question.text}</span>
          </div>

          {/* Choices */}
          <div className="math-basic__choices">
            {question.choices.map((choice) => (
              <button
                key={choice}
                className={`math-basic__choice ${
                  selectedAnswer === choice
                    ? isCorrect ? 'correct' : 'wrong'
                    : ''
                } ${selectedAnswer !== null && choice === question.answer ? 'show-correct' : ''}`}
                onClick={() => handleAnswer(choice)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      <WinModal
        show={showWin}
        stars={getStars()}
        message={`太棒了！答對 ${score} / ${totalQuestions} 題！`}
        onReplay={() => { resetGame(); newQuestion() }}
        onHome={() => navigate('/')}
        onNextLevel={nextDifficultyUnlocked ? handleNextDifficulty : undefined}
        nextLevelLabel={nextDifficulty ? `挑戰${DIFFICULTY_LEVELS[nextDifficulty].label}` : undefined}
      />
    </div>
  )
}
