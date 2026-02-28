import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import { useSpeak } from '../../hooks/useSpeak'
import { useProfile, DIFFICULTY_LEVELS, getNextLevel } from '../../contexts/ProfileContext'
import BackButton from '../../components/BackButton/BackButton'
import WinModal from '../../components/WinModal/WinModal'
import LevelSelect from '../../components/LevelSelect/LevelSelect'
import './ZhuyinLearn.scss'

const ZHUYIN_DATA = [
  { symbol: 'ㄅ', pinyin: 'b', word: '爸爸', emoji: '👨' },
  { symbol: 'ㄆ', pinyin: 'p', word: '蘋果', emoji: '🍎' },
  { symbol: 'ㄇ', pinyin: 'm', word: '媽媽', emoji: '👩' },
  { symbol: 'ㄈ', pinyin: 'f', word: '飛機', emoji: '✈️' },
  { symbol: 'ㄉ', pinyin: 'd', word: '大象', emoji: '🐘' },
  { symbol: 'ㄊ', pinyin: 't', word: '兔子', emoji: '🐰' },
  { symbol: 'ㄋ', pinyin: 'n', word: '牛奶', emoji: '🥛' },
  { symbol: 'ㄌ', pinyin: 'l', word: '老虎', emoji: '🐯' },
  { symbol: 'ㄍ', pinyin: 'g', word: '狗狗', emoji: '🐶' },
  { symbol: 'ㄎ', pinyin: 'k', word: '恐龍', emoji: '🦕' },
  { symbol: 'ㄏ', pinyin: 'h', word: '花朵', emoji: '🌸' },
  { symbol: 'ㄐ', pinyin: 'j', word: '雞蛋', emoji: '🥚' },
  { symbol: 'ㄑ', pinyin: 'q', word: '氣球', emoji: '🎈' },
  { symbol: 'ㄒ', pinyin: 'x', word: '西瓜', emoji: '🍉' },
  { symbol: 'ㄓ', pinyin: 'zh', word: '蜘蛛', emoji: '🕷️' },
  { symbol: 'ㄔ', pinyin: 'ch', word: '車子', emoji: '🚗' },
  { symbol: 'ㄕ', pinyin: 'sh', word: '獅子', emoji: '🦁' },
  { symbol: 'ㄖ', pinyin: 'r', word: '太陽', emoji: '☀️' },
  { symbol: 'ㄗ', pinyin: 'z', word: '桌子', emoji: '🪑' },
  { symbol: 'ㄘ', pinyin: 'c', word: '草莓', emoji: '🍓' },
  { symbol: 'ㄙ', pinyin: 's', word: '三角', emoji: '🔺' },
  { symbol: 'ㄚ', pinyin: 'a', word: '阿姨', emoji: '👧' },
  { symbol: 'ㄛ', pinyin: 'o', word: '喔喔', emoji: '🐓' },
  { symbol: 'ㄜ', pinyin: 'e', word: '鵝鵝', emoji: '🦢' },
  { symbol: 'ㄝ', pinyin: 'ê', word: '耶耶', emoji: '✌️' },
  { symbol: 'ㄞ', pinyin: 'ai', word: '愛心', emoji: '❤️' },
  { symbol: 'ㄟ', pinyin: 'ei', word: '杯子', emoji: '🥤' },
  { symbol: 'ㄠ', pinyin: 'ao', word: '小貓', emoji: '🐱' },
  { symbol: 'ㄡ', pinyin: 'ou', word: '歐歐', emoji: '🌍' },
  { symbol: 'ㄢ', pinyin: 'an', word: '安安', emoji: '😊' },
  { symbol: 'ㄣ', pinyin: 'en', word: '恩恩', emoji: '👍' },
  { symbol: 'ㄤ', pinyin: 'ang', word: '糖果', emoji: '🍬' },
  { symbol: 'ㄥ', pinyin: 'eng', word: '風箏', emoji: '🪁' },
  { symbol: 'ㄦ', pinyin: 'er', word: '耳朵', emoji: '👂' },
  { symbol: 'ㄧ', pinyin: 'i', word: '衣服', emoji: '👕' },
  { symbol: 'ㄨ', pinyin: 'u', word: '烏龜', emoji: '🐢' },
  { symbol: 'ㄩ', pinyin: 'ü', word: '魚兒', emoji: '🐟' },
]

const GAME_MODES = [
  { id: 'learn', title: '📖 認識注音', description: '學習ㄅㄆㄇ' },
  { id: 'match', title: '🎯 注音配對', description: '看圖找注音' },
  { id: 'order', title: '🔤 注音排序', description: '按照順序排列' },
]

const LEVEL_CONFIG = {
  beginner: { label: '初級', totalQuestions: 5, symbolRange: 10, orderSize: 4 },
  intermediate: { label: '中級', totalQuestions: 6, symbolRange: 16, orderSize: 5 },
  advanced: { label: '高級', totalQuestions: 8, symbolRange: 21, orderSize: 6 },
  expert: { label: '專家', totalQuestions: 10, symbolRange: 30, orderSize: 7 },
  master: { label: '大師', totalQuestions: 12, symbolRange: 37, orderSize: 8 },
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ZhuyinLearn() {
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
  const [orderSequence, setOrderSequence] = useState([])
  const [orderSymbols, setOrderSymbols] = useState([])

  const config = difficulty ? LEVEL_CONFIG[difficulty] : null
  const totalQuestions = config?.totalQuestions || 5
  const symbolPool = config ? ZHUYIN_DATA.slice(0, config.symbolRange) : ZHUYIN_DATA

  // 學習模式自動播放語音
  useEffect(() => {
    if (mode !== 'learn' || !config) return
    const pool = ZHUYIN_DATA.slice(0, config.symbolRange)
    const item = pool[learnIndex]
    if (item) {
      setTimeout(() => speakZh(item.word), 300)
    }
  }, [mode, learnIndex, config, speakZh])

  // 進入模式時的語音說明
  useEffect(() => {
    if (mode === 'learn') {
      speakDelayed('一起來認識注音符號吧！')
    } else if (mode === 'match') {
      speakDelayed('看圖片，找出正確的注音符號！')
    } else if (mode === 'order') {
      speakDelayed('按照順序排列注音符號喔！')
    }
  }, [mode, speakDelayed])

  // 追蹤已出過的題目，避免重複
  const usedMatchIndices = useRef(new Set())

  const generateMatchQuestion = useCallback(() => {
    const pool = difficulty ? ZHUYIN_DATA.slice(0, LEVEL_CONFIG[difficulty].symbolRange) : ZHUYIN_DATA
    // 從未使用過的題目中選擇
    let available = pool.filter((_, i) => !usedMatchIndices.current.has(i))
    if (available.length === 0) {
      usedMatchIndices.current.clear()
      available = pool
    }
    const item = available[Math.floor(Math.random() * available.length)]
    const itemIdx = pool.indexOf(item)
    usedMatchIndices.current.add(itemIdx)

    const wrongSymbols = shuffleArray(
      ZHUYIN_DATA.filter(a => a.symbol !== item.symbol)
    ).slice(0, 3).map(a => a.symbol)
    const choices = shuffleArray([item.symbol, ...wrongSymbols])

    setQuestion({ item, choices })
    setSelectedAnswer(null)
    setIsCorrect(null)
  }, [difficulty])

  const generateOrderGame = useCallback(() => {
    const size = config?.orderSize || 4
    const pool = difficulty ? ZHUYIN_DATA.slice(0, LEVEL_CONFIG[difficulty].symbolRange) : ZHUYIN_DATA
    const startIdx = Math.floor(Math.random() * Math.max(1, pool.length - size))
    const symbols = pool.slice(startIdx, startIdx + size).map(a => a.symbol)
    setOrderSymbols(shuffleArray([...symbols]))
    setOrderSequence([])
  }, [difficulty, config])

  useEffect(() => {
    if (mode === 'match') generateMatchQuestion()
    if (mode === 'order') generateOrderGame()
  }, [mode, generateMatchQuestion, generateOrderGame])

  const handleMatchAnswer = (symbol) => {
    if (selectedAnswer !== null) return
    playClick()
    setSelectedAnswer(symbol)

    if (symbol === question.item.symbol) {
      setIsCorrect(true)
      playCorrect()
      setScore(s => s + 1)
      setTimeout(() => {
        if (questionIndex + 1 >= totalQuestions) {
          playWin()
          const stars = getStars()
          recordGame('zhuyin-learn', '注音符號', stars, `${config.label} · 注音配對，答對 ${score + 1} 題`, difficulty)
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

  const handleOrderClick = (symbol) => {
    if (orderSequence.includes(symbol)) return
    playClick()

    // The correct order is the sorted (original index) order
    const allSymbols = [...orderSymbols].sort((a, b) => {
      const idxA = ZHUYIN_DATA.findIndex(z => z.symbol === a)
      const idxB = ZHUYIN_DATA.findIndex(z => z.symbol === b)
      return idxA - idxB
    })
    const expectedNext = allSymbols[orderSequence.length]

    if (symbol === expectedNext) {
      playCorrect()
      const newSeq = [...orderSequence, symbol]
      setOrderSequence(newSeq)

      if (newSeq.length === orderSymbols.length) {
        setScore(s => s + 1)
        setTimeout(() => {
          if (questionIndex + 1 >= totalQuestions) {
            playWin()
            const stars = getStars()
            recordGame('zhuyin-learn', '注音符號', stars, `${config.label} · 注音排序完成，答對 ${score + 1} 題`, difficulty)
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
    setOrderSymbols([])
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
    setOrderSymbols([])
    usedMatchIndices.current.clear()
    // 保持模式不變，直接進入下一難度
    setMode(currentMode)
  }

  if (!difficulty) {
    return (
      <LevelSelect
        gameId="zhuyin-learn"
        gameName="注音符號"
        gameEmoji="ㄅ"
        onSelectLevel={setDifficulty}
        onBack={() => navigate('/')}
      />
    )
  }

  // Learning mode - browse zhuyin cards
  if (mode === 'learn') {
    const item = symbolPool[learnIndex]
    return (
      <div className="zhuyin-learn">
        <BackButton />
        <div className="zhuyin-learn__header">
          <h1 className="zhuyin-learn__title">ㄅ 認識注音</h1>
          <div className="zhuyin-learn__level-badge">{config.label}</div>
          <p className="zhuyin-learn__subtitle">
            第 {learnIndex + 1} / {symbolPool.length} 個注音
          </p>
        </div>

        <div className="zhuyin-learn__card-display">
          <div className="zhuyin-learn__big-card">
            <div className="zhuyin-learn__big-symbol">{item.symbol}</div>
            <div className="zhuyin-learn__big-emoji">{item.emoji}</div>
            <div className="zhuyin-learn__big-word">
              <span className="zhuyin-learn__word-text">{item.word}</span>
              <button
                className="zhuyin-learn__speak-btn"
                onClick={(e) => { e.stopPropagation(); speakZh(item.word) }}
                title="播放語音"
              >
                🔊
              </button>
            </div>
          </div>
        </div>

        <div className="zhuyin-learn__nav">
          <button
            className="zhuyin-learn__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.max(0, i - 1)) }}
            disabled={learnIndex === 0}
          >
            ⬅️ 上一個
          </button>
          <button
            className="zhuyin-learn__nav-btn zhuyin-learn__nav-btn--back"
            onClick={() => { playClick(); setMode(null) }}
          >
            📋 選單
          </button>
          <button
            className="zhuyin-learn__nav-btn"
            onClick={() => { playClick(); setLearnIndex(i => Math.min(symbolPool.length - 1, i + 1)) }}
            disabled={learnIndex === symbolPool.length - 1}
          >
            下一個 ➡️
          </button>
        </div>
      </div>
    )
  }

  // Match mode
  if (mode === 'match' && question) {
    return (
      <div className="zhuyin-learn">
        <BackButton />
        <div className="zhuyin-learn__header">
          <h1 className="zhuyin-learn__title">🎯 注音配對</h1>
          <div className="zhuyin-learn__level-badge">{config.label}</div>
          <div className="zhuyin-learn__stats">
            <span className="zhuyin-learn__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="zhuyin-learn__stat">✅ {score}</span>
          </div>
        </div>

        <div className="zhuyin-learn__match-game">
          <div className="zhuyin-learn__match-prompt">
            <span className="zhuyin-learn__match-emoji">{question.item.emoji}</span>
            <span className="zhuyin-learn__match-word">
              {question.item.word}
              <button
                className="zhuyin-learn__speak-btn zhuyin-learn__speak-btn--small"
                onClick={(e) => { e.stopPropagation(); speakZh(question.item.word) }}
                title="播放語音"
              >
                🔊
              </button>
            </span>
            <span className="zhuyin-learn__match-hint">這個字的注音開頭是什麼？</span>
          </div>

          <div className="zhuyin-learn__match-choices">
            {question.choices.map((symbol) => (
              <button
                key={symbol}
                className={`zhuyin-learn__match-btn ${
                  selectedAnswer === symbol
                    ? isCorrect ? 'correct' : 'wrong'
                    : ''
                } ${selectedAnswer && symbol === question.item.symbol ? 'show-correct' : ''}`}
                onClick={() => handleMatchAnswer(symbol)}
                disabled={selectedAnswer !== null && isCorrect}
              >
                {symbol}
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

  // Order mode
  if (mode === 'order') {
    const sortedSymbols = [...orderSymbols].sort((a, b) => {
      const idxA = ZHUYIN_DATA.findIndex(z => z.symbol === a)
      const idxB = ZHUYIN_DATA.findIndex(z => z.symbol === b)
      return idxA - idxB
    })
    return (
      <div className="zhuyin-learn">
        <BackButton />
        <div className="zhuyin-learn__header">
          <h1 className="zhuyin-learn__title">🔤 注音排序</h1>
          <div className="zhuyin-learn__level-badge">{config.label}</div>
          <div className="zhuyin-learn__stats">
            <span className="zhuyin-learn__stat">📝 {questionIndex + 1}/{totalQuestions}</span>
            <span className="zhuyin-learn__stat">✅ {score}</span>
          </div>
        </div>

        <div className="zhuyin-learn__order-game">
          <p className="zhuyin-learn__order-prompt">按照注音順序點選！</p>
          <div className="zhuyin-learn__order-done">
            {orderSequence.map((symbol, i) => (
              <span key={i} className="zhuyin-learn__order-item done">{symbol}</span>
            ))}
            {orderSequence.length < orderSymbols.length && (
              <span className="zhuyin-learn__order-item next">?</span>
            )}
          </div>
          <div className="zhuyin-learn__order-choices">
            {orderSymbols.map((symbol) => (
              <button
                key={symbol}
                className={`zhuyin-learn__order-btn ${orderSequence.includes(symbol) ? 'used' : ''}`}
                onClick={() => handleOrderClick(symbol)}
                disabled={orderSequence.includes(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        <WinModal
          show={showWin}
          stars={getStars()}
          message={`注音排序完成！答對 ${score} 題！`}
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
    <div className="zhuyin-learn">
      <BackButton />
      <div className="zhuyin-learn__header">
        <h1 className="zhuyin-learn__title">ㄅ 注音符號</h1>
        <div className="zhuyin-learn__level-badge">{config.label}</div>
        <p className="zhuyin-learn__subtitle">選擇一個學習模式</p>
      </div>

      <div className="zhuyin-learn__menu">
        {GAME_MODES.map((gm) => (
          <button
            key={gm.id}
            className="zhuyin-learn__menu-btn"
            onClick={() => { playClick(); setMode(gm.id) }}
          >
            <span className="zhuyin-learn__menu-title">{gm.title}</span>
            <span className="zhuyin-learn__menu-desc">{gm.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
