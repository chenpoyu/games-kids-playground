import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './NumberLearn.scss'

const LEVELS = [
  {
    id: 1,
    title: '認識 1~5',
    numbers: [1, 2, 3, 4, 5],
    type: 'count',
  },
  {
    id: 2,
    title: '認識 6~10',
    numbers: [6, 7, 8, 9, 10],
    type: 'count',
  },
  {
    id: 3,
    title: '認識 1~10 (混合)',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'count',
  },
  {
    id: 4,
    title: '數字排序 1~10',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'order',
  },
]

const LEVEL_CONFIG = {
  beginner: {
    label: '初級',
    stages: [LEVELS[0]], // 1~5
    totalQuestions: 3,
  },
  intermediate: {
    label: '中級',
    stages: [LEVELS[0], LEVELS[1]], // 1~5 then 6~10
    totalQuestions: 5,
  },
  advanced: {
    label: '高級',
    stages: [LEVELS[1], LEVELS[2], LEVELS[3]], // 6~10, 混合, then ordering
    totalQuestions: 5,
  },
  expert: {
    label: '專家',
    stages: [LEVELS[2], LEVELS[3]], // 混合 count, then ordering
    totalQuestions: 7,
  },
  master: {
    label: '大師',
    stages: [LEVELS[2], LEVELS[3]], // 混合 count, ordering, more questions
    totalQuestions: 10,
  },
}

const ITEM_EMOJIS = ['🍎', '🌟', '🐟', '🦋', '🍒', '🌸', '🐣', '🎈', '🍬', '🧩', '🐝', '🌻', '🍄', '🐢', '🍊', '🦊']

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateCountQuestion(numbers) {
  const num = numbers[Math.floor(Math.random() * numbers.length)]
  const emoji = ITEM_EMOJIS[Math.floor(Math.random() * ITEM_EMOJIS.length)]
  const items = Array(num).fill(emoji)
  // Generate 3 wrong answers + 1 correct answer
  const choices = new Set([num])
  // Build candidate pool of nearby numbers that differ from num
  const candidates = []
  for (let i = Math.max(1, num - 3); i <= num + 3; i++) {
    if (i !== num) candidates.push(i)
  }
  // Shuffle candidates
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  for (const c of candidates) {
    if (choices.size >= 4) break
    choices.add(c)
  }
  return {
    items,
    emoji,
    correctAnswer: num,
    choices: shuffleArray([...choices]),
    question: `有幾個 ${emoji}？`,
  }
}

function generateOrderQuestion(numbers) {
  return {
    type: 'order',
    numbers: shuffleArray([...numbers]),
    correctOrder: [...numbers].sort((a, b) => a - b),
  }
}

export default function NumberLearn() {
  const navigate = useNavigate()
  const { playCorrect, playWrong, playClick, playWin } = useSound()
  const { speakZh, speakDelayed } = useSpeak()
  const { recordGame } = useProfile()
  const [difficulty, setDifficulty] = useState(null)
  const [currentStage, setCurrentStage] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [orderSequence, setOrderSequence] = useState([])
  const [nextExpected, setNextExpected] = useState(0)

  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  const totalQuestions = config?.totalQuestions || 5
  const stages = config?.stages || []
  const level = stages[currentStage] || LEVELS[0]

  // 追蹤已出過的題目，避免重複
  const usedNumbers = useRef(new Set())

  const generateQuestion = useCallback(() => {
    if (!difficulty) return
    const stgs = LEVEL_CONFIG[difficulty].stages
    const lvl = stgs[currentStage] || stgs[0]
    if (lvl.type === 'count') {
      let q
      let attempts = 0
      do {
        q = generateCountQuestion(lvl.numbers)
        attempts++
      } while (usedNumbers.current.has(q.correctAnswer) && attempts < 20)
      usedNumbers.current.add(q.correctAnswer)
      setQuestion(q)
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      const q = generateOrderQuestion(lvl.numbers)
      setQuestion(q)
      setOrderSequence([])
      setNextExpected(0)
    }
  }, [difficulty, currentStage])

  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  // 進入關卡時的語音說明
  useEffect(() => {
    if (!difficulty) return
    const stgs = LEVEL_CONFIG[difficulty].stages
    const lvl = stgs[currentStage] || stgs[0]
    if (lvl.type === 'count') {
      speakDelayed('數一數，有幾個呢？選出正確的數字吧！')
    } else {
      speakDelayed('按照從小到大的順序點數字喔！')
    }
  }, [difficulty, currentStage, speakDelayed])

  const handleCountAnswer = (answer) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(answer)

    if (answer === question.correctAnswer) {
      setIsCorrect(true)
      playCorrect()
      speakZh(String(answer))
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1
          recordGame('number-learn', '數字學習', stars, `${config.label} · 第 ${currentStage + 1} 關，答對 ${score + 1} 題`, difficulty)
          setShowWin(true)
        } else {
          setQuestionIndex(q => q + 1)
          generateQuestion()
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

  const handleOrderClick = (num) => {
    if (orderSequence.includes(num)) return
    playClick()

    const expected = question.correctOrder[nextExpected]
    if (num === expected) {
      playCorrect()
      const newSeq = [...orderSequence, num]
      setOrderSequence(newSeq)
      setNextExpected(n => n + 1)

      if (newSeq.length === question.correctOrder.length) {
        setScore(s => s + 1)
        setTimeout(() => {
          if (questionIndex + 1 >= totalQuestions) {
            playWin()
            const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1
            recordGame('number-learn', '數字學習', stars, `${config.label} · 第 ${currentStage + 1} 關排序完成`, difficulty)
            setShowWin(true)
          } else {
            setQuestionIndex(q => q + 1)
            generateQuestion()
          }
        }, 800)
      }
    } else {
      playWrong()
      setErrors(e => e + 1)
    }
  }

  const resetGame = () => {
    setCurrentStage(0)
    setQuestionIndex(0)
    setScore(0)
    setErrors(0)
    setShowWin(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setOrderSequence([])
    setNextExpected(0)
    usedNumbers.current.clear()
  }

  const nextLevel = () => {
    if (currentStage + 1 < stages.length) {
      setCurrentStage(c => c + 1)
      setQuestionIndex(0)
      setScore(0)
      setErrors(0)
      setShowWin(false)
    } else {
      resetGame()
    }
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
        gameId="number-learn"
        gameName="數字學習"
        gameEmoji="🔢"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }

  return (
    <div className="number-learn">
      <BackButton />

      <div className="number-learn__header">
        <h1 className="number-learn__title">🔢 數字學習</h1>
        <div className="number-learn__level-badge">{config.label}</div>
        <p className="number-learn__subtitle">{level.title}</p>
        <div className="number-learn__stats">
          <span className="number-learn__stat">
            📝 第 {questionIndex + 1}/{totalQuestions} 題
          </span>
          <span className="number-learn__stat">
            ✅ 答對 {score} 題
          </span>
          <span className="number-learn__stat">
            ⭐ 第 {currentStage + 1}/{stages.length} 關
          </span>
        </div>
      </div>

      {level.type === 'count' && question && (
        <div className="number-learn__count-game">
          <div className="number-learn__question">
            <p className="number-learn__question-text">{question.question}</p>
            <div className="number-learn__items">
              {question.items.map((item, i) => (
                <span key={i} className="number-learn__item">{item}</span>
              ))}
            </div>
          </div>
          <div className="number-learn__choices">
            {question.choices.map((choice) => (
              <button
                key={choice}
                className={`number-learn__choice ${
                  selectedAnswer === choice
                    ? isCorrect
                      ? 'correct'
                      : 'wrong'
                    : ''
                } ${selectedAnswer !== null && choice === question.correctAnswer ? 'show-correct' : ''}`}
                onClick={() => handleCountAnswer(choice)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                <span className="number-learn__choice-number">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {level.type === 'order' && question && (
        <div className="number-learn__order-game">
          <p className="number-learn__question-text">
            按照從小到大的順序點數字！
          </p>
          <div className="number-learn__order-done">
            {orderSequence.map((num, i) => (
              <span key={i} className="number-learn__order-num done">{num}</span>
            ))}
            {orderSequence.length < question.correctOrder.length && (
              <span className="number-learn__order-num next">?</span>
            )}
          </div>
          <div className="number-learn__order-choices">
            {question.numbers.map((num) => (
              <button
                key={num}
                className={`number-learn__order-btn ${orderSequence.includes(num) ? 'used' : ''}`}
                onClick={() => handleOrderClick(num)}
                disabled={orderSequence.includes(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      <WinModal
        show={showWin}
        stars={getStars()}
        message={
          currentStage + 1 < stages.length
            ? `太棒了！準備挑戰第 ${currentStage + 2} 關！`
            : `恭喜！你完成了所有關卡！答對 ${score} 題！`
        }
        onReplay={currentStage + 1 < stages.length ? nextLevel : resetGame}
        onHome={() => navigate('/')}
        onNextLevel={currentStage + 1 >= stages.length && nextDifficultyUnlocked ? handleNextDifficulty : undefined}
        nextLevelLabel={nextDifficulty ? `挑戰${DIFFICULTY_LEVELS[nextDifficulty].label}` : undefined}
      />
    </div>
  )
}
