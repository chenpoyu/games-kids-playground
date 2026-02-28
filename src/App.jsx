import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import History from './pages/History/History'
import About from './pages/About/About'
import ColorMatch from './games/ColorMatch/ColorMatch'
import AnimalPuzzle from './games/AnimalPuzzle/AnimalPuzzle'
import BalloonPop from './games/BalloonPop/BalloonPop'
import ShapeSort from './games/ShapeSort/ShapeSort'
import NumberLearn from './games/NumberLearn/NumberLearn'
import ABCLearn from './games/ABCLearn/ABCLearn'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/color-match" element={<ColorMatch />} />
      <Route path="/animal-puzzle" element={<AnimalPuzzle />} />
      <Route path="/balloon-pop" element={<BalloonPop />} />
      <Route path="/shape-sort" element={<ShapeSort />} />
      <Route path="/number-learn" element={<NumberLearn />} />
      <Route path="/abc-learn" element={<ABCLearn />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App
