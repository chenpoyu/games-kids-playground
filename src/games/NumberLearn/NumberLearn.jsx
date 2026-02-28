import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useProgress } from '../../hooks/useProgress'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import './NumberLearn.scss'

const LEVELS = [
  {
    id: 1,
    title: '認識 1~5',
    numbers: [1, 2, 3, 4, 5],
    type: 'count', // 數一數有幾個
  },
  {
    id: 2,
    title: '認識 6~10',
    numbers: [6, 7, 8, 9, 10],
    type: 'count',
  },
  {
    id: 3,
    title: '數字排序 1~10',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    type: 'order',
  },
]

const ITEM_EMOJIS = ['🍎', '🌟', '🐟', '🦋', '🍒', '🌸', '🐣', '🎈', '🍬', '🧩']

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
  const { recordGame } = useProgress()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [question, setQuestion] = useState(null)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [showWin, setShowWin] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [orderSequence, setOrderSequence] = useState([])
  const [nextExpected, setNextExpected] = useState(0)

  const totalQuestions = 5
  const level = LEVELS[currentLevel]

  const generateQuestion = useCallback(() => {
    const lvl = LEVELS[currentLevel]
    if (lvl.type === 'count') {
      setQuestion(generateCountQuestion(lvl.numbers))
      setSelectedAnswer(null)
      setIsCorrect(null)
    } else {
      const q = generateOrderQuestion(lvl.numbers)
      setQuestion(q)
      setOrderSequence([])
      setNextExpected(0)
    }
  }, [currentLevel])

  useEffect(() => {
    generateQuestion()
  }, [generateQuestion])

  const handleCountAnswer = (answer) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(answer)

    if (answer === question.correctAnswer) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = errors === 0 ? 3 : errors <= 2 ? 2 : 1
          recordGame('number-learn', '數字學習', stars, `第 ${currentLevel + 1} 關，答對 ${score + 1} 題`)
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
            recordGame('number-learn', '數字學習', stars, `第 ${currentLevel + 1} 關排序完成`)
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
    setCurrentLevel(0)
    setQuestionIndex(0)
    setScore(0)
    setErrors(0)
    setShowWin(false)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setOrderSequence([])
    setNextExpected(0)
    generateQuestion()
  }

  const nextLevel = () => {
    if (currentLevel + 1 < LEVELS.length) {
      setCurrentLevel(c => c + 1)
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

  return (
    <div className="number-learn">
      <BackButton />

      <div className="number-learn__header">
        <h1 className="number-learn__title">🔢 數字學習</h1>
        <p className="number-learn__subtitle">{level.title}</p>
        <div className="number-learn__stats">
          <span className="number-learn__stat">
            📝 第 {questionIndex + 1}/{totalQuestions} 題
          </span>
          <span className="number-learn__stat">
            ✅ 答對 {score} 題
          </span>
          <span className="number-learn__stat">
            ⭐ 第 {currentLevel + 1} 關
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
          currentLevel + 1 < LEVELS.length
            ? `太棒了！準備挑戰第 ${currentLevel + 2} 關！`
            : `恭喜！你完成了所有關卡！答對 ${score} 題！`
        }
        onReplay={currentLevel + 1 < LEVELS.length ? nextLevel : resetGame}
        onHome={() => navigate('/')}
      />
    </div>
  )
}
