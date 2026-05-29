import { useState, useEffect, useRef } from 'react'
import { IS_MOCK_MODE } from '../config/runtime'

const PROMO_VIDEO_URL = IS_MOCK_MODE ? '' : 'http://localhost:9000/pharmalab-media/promo.mp4'

function HeroVideo() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const videoRef = useRef(null)
  
  const phrases = [
    'Создаем лекарственные препараты для жизни',
    'Полный цикл производства лекарств',
    'Качество, проверенное временем',
    'Инновации в фармацевтике'
  ]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => undefined)
    }
    
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [phrases.length])

  return (
    <div className="hero-video-container">
      {PROMO_VIDEO_URL && (
        <video
          ref={videoRef}
          className="hero-background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={PROMO_VIDEO_URL} type="video/mp4" />
          Ваш браузер не поддерживает видео
        </video>
      )}
      <div className="hero-overlay-dark"></div>
      <div className="hero-content-center">
        <div className="hero-kicker">PharmaLab</div>
        <div className="hero-phrases-block" aria-live="polite">
          {phrases.map((phrase, index) => (
            <h1
              key={index}
              className={`hero-phrase ${index === currentPhraseIndex ? 'active' : ''}`}
            >
              {phrase}
            </h1>
          ))}
        </div>
        <p className="hero-subtitle">
          Фармацевтические субстанции, лабораторная точность и прозрачная работа с заявками
        </p>
        <div className="hero-accent-line" aria-hidden="true"></div>
      </div>
    </div>
  )
}

export default HeroVideo
