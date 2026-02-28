import { useNavigate } from 'react-router-dom'
import { useSound } from '../../hooks/useSound'
import BackButton from '../../components/BackButton/BackButton'
import './About.scss'

const FEATURES = [
  {
    emoji: '🎮',
    title: '趣味遊戲',
    desc: '多款精心設計的互動遊戲，在玩樂中學習',
  },
  {
    emoji: '🔢',
    title: '數字學習',
    desc: '認識數字 1~10，學習數數和排序',
  },
  {
    emoji: '🔤',
    title: '英文字母',
    desc: '認識 A~Z 字母，學習字母配對與排序',
  },
  {
    emoji: '🧩',
    title: '記憶訓練',
    desc: '翻翻樂和配對遊戲，訓練記憶力',
  },
  {
    emoji: '⭐',
    title: '星星積分',
    desc: '每次過關獲得星星，累積成就感',
  },
  {
    emoji: '📚',
    title: '學習履歷',
    desc: '記錄每次遊玩成果，追蹤學習進度',
  },
]

const GAME_LIST = [
  { emoji: '🎨', name: '顏色配對', age: '2+', desc: '翻開卡片找出相同顏色，訓練記憶力與顏色辨識能力' },
  { emoji: '🦁', name: '動物記憶翻翻樂', age: '3+', desc: '翻翻卡片找出一樣的動物，培養觀察力和記憶力' },
  { emoji: '🎈', name: '數字氣球', age: '3+', desc: '按照 1、2、3 的順序戳氣球，學習數字序列' },
  { emoji: '🔷', name: '形狀排排看', age: '2+', desc: '認識基本形狀，將形狀放到正確的位置' },
  { emoji: '🔢', name: '數字學習', age: '3+', desc: '數一數、認數字、排順序，三種模式循序漸進' },
  { emoji: '🔤', name: 'ABC 英文字母', age: '4+', desc: '認識 26 個字母，學習字母配對和排序' },
]

export default function About() {
  const navigate = useNavigate()
  const { playClick } = useSound()

  return (
    <div className="about">
      <BackButton />

      {/* Hero 區塊 */}
      <div className="about__hero">
        <div className="about__hero-emoji">🎮</div>
        <h1 className="about__hero-title">歡樂小遊戲樂園</h1>
        <p className="about__hero-subtitle">
          專為 2~6 歲學齡前兒童設計的互動學習平台
        </p>
        <p className="about__hero-desc">
          結合遊戲與學習，讓孩子在快樂中認識數字、字母、顏色和形狀
        </p>
      </div>

      {/* 特色介紹 */}
      <section className="about__section">
        <h2 className="about__section-title">✨ 平台特色</h2>
        <div className="about__features">
          {FEATURES.map((f, i) => (
            <div key={i} className="about__feature-card">
              <span className="about__feature-emoji">{f.emoji}</span>
              <h3 className="about__feature-title">{f.title}</h3>
              <p className="about__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 遊戲一覽 */}
      <section className="about__section">
        <h2 className="about__section-title">🎯 遊戲一覽</h2>
        <div className="about__games-list">
          {GAME_LIST.map((g, i) => (
            <div key={i} className="about__game-item">
              <span className="about__game-emoji">{g.emoji}</span>
              <div className="about__game-info">
                <div className="about__game-header">
                  <span className="about__game-name">{g.name}</span>
                  <span className="about__game-age">{g.age} 歲</span>
                </div>
                <p className="about__game-desc">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 使用說明 */}
      <section className="about__section">
        <h2 className="about__section-title">📖 使用說明</h2>
        <div className="about__guide">
          <div className="about__guide-step">
            <span className="about__guide-num">1</span>
            <p>在首頁選擇想玩的遊戲</p>
          </div>
          <div className="about__guide-step">
            <span className="about__guide-num">2</span>
            <p>按照遊戲提示完成挑戰</p>
          </div>
          <div className="about__guide-step">
            <span className="about__guide-num">3</span>
            <p>過關後獲得 1~3 顆星星</p>
          </div>
          <div className="about__guide-step">
            <span className="about__guide-num">4</span>
            <p>到「學習履歷」查看進度和成就</p>
          </div>
        </div>
      </section>

      {/* 家長須知 */}
      <section className="about__section">
        <h2 className="about__section-title">👨‍👩‍👧‍👦 家長須知</h2>
        <div className="about__parent-info">
          <p>🔒 完全免費且無廣告，安全的兒童遊戲環境</p>
          <p>📱 支援手機、平板、電腦，隨時隨地都能玩</p>
          <p>🔊 內建音效回饋，增加互動樂趣</p>
          <p>📊 學習紀錄保存在裝置上，保護隱私</p>
          <p>⏰ 建議每次遊玩 15~20 分鐘，適度休息</p>
        </div>
      </section>

      <div className="about__cta">
        <button className="about__cta-btn" onClick={() => { playClick(); navigate('/') }}>
          🎮 開始玩遊戲！
        </button>
      </div>

      <footer className="about__footer">
        <p>🌟 歡樂小遊戲樂園 — 讓學習充滿歡笑 🌟</p>
        <p className="about__footer-tech">適合 2~6 歲兒童</p>
        <p className="about__footer-dev">© 2026 Poyu.Chen</p>
      </footer>
    </div>
  )
}
