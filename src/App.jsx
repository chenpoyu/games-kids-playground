import { Routes, Route } from 'react-router-dom'
import { ProfileProvider, useProfile } from './contexts/ProfileContext'
import ProfileSelect from './components/ProfileSelect/ProfileSelect'
import Home from './pages/Home/Home'
import LearningMap from './pages/LearningMap/LearningMap'
import History from './pages/History/History'
import About from './pages/About/About'
import ColorMatch from './games/ColorMatch/ColorMatch'
import AnimalPuzzle from './games/AnimalPuzzle/AnimalPuzzle'
import BalloonPop from './games/BalloonPop/BalloonPop'
import ShapeSort from './games/ShapeSort/ShapeSort'
import NumberLearn from './games/NumberLearn/NumberLearn'
import ABCLearn from './games/ABCLearn/ABCLearn'
import ZhuyinLearn from './games/ZhuyinLearn/ZhuyinLearn'
import MathBasic from './games/MathBasic/MathBasic'
import ChineseChar from './games/ChineseChar/ChineseChar'

function AppContent() {
  const { activeProfile } = useProfile()

  // 若尚未選擇學員，顯示學習護照選擇畫面
  if (!activeProfile) {
    return <ProfileSelect />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning-map" element={<LearningMap />} />
      <Route path="/color-match" element={<ColorMatch />} />
      <Route path="/animal-puzzle" element={<AnimalPuzzle />} />
      <Route path="/balloon-pop" element={<BalloonPop />} />
      <Route path="/shape-sort" element={<ShapeSort />} />
      <Route path="/number-learn" element={<NumberLearn />} />
      <Route path="/abc-learn" element={<ABCLearn />} />
      <Route path="/zhuyin-learn" element={<ZhuyinLearn />} />
      <Route path="/math-basic" element={<MathBasic />} />
      <Route path="/chinese-char" element={<ChineseChar />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

function App() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  )
}

export default App
