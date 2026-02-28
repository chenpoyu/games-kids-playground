import './StarScore.scss'

export default function StarScore({ current, total }) {
  return (
    <div className="star-score">
      <span className="star-score__label">得分</span>
      <div className="star-score__stars">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`star-score__star ${i < current ? 'filled' : ''}`}>
            {i < current ? '⭐' : '⚝'}
          </span>
        ))}
      </div>
    </div>
  )
}
