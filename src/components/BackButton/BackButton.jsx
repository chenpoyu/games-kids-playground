import { useNavigate } from 'react-router-dom'
import './BackButton.scss'

export default function BackButton() {
  const navigate = useNavigate()
  
  return (
    <button 
      className="back-button" 
      onClick={() => navigate('/')}
      aria-label="回首頁"
    >
      <span className="back-button__icon">🏠</span>
      <span className="back-button__text">回首頁</span>
    </button>
  )
}
