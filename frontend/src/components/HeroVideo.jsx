import React, { useState, useEffect, useRef } from 'react'

const PROMO_VIDEO_URL = 'http://localhost:9000/pharmalab-media/promo.mp4'

function HeroVideo() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const videoRef = useRef(null)
  
  const phrases = [
    'СОЗДАЕМ ЛЕКАРСТВЕННЫЕ ПРЕПАРАТЫ ДЛЯ ЖИЗНИ',
    'ПОЛНЫЙ ЦИКЛ ПРОИЗВОДСТВА ЛЕКАРСТВ',
    'КАЧЕСТВО, ПРОВЕРЕННОЕ ВРЕМЕНЕМ',
    'ИННОВАЦИИ В ФАРМАЦЕВТИКЕ'
  ]

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(e => console.log('Видео не запустилось автоматически', e))
    }
    
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [phrases.length])

  return (
    <div className="hero-video-container">
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
      <div className="hero-overlay-dark"></div>
      <div className="hero-content-center">
        <div className="hero-phrases-block">
          {phrases.map((phrase, index) => (
            <div 
              key={index}
              className={`hero-phrase ${index === currentPhraseIndex ? 'active' : ''}`}
            >
              {phrase}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroVideo