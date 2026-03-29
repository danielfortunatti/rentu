import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Interactive mascot — a friendly blob creature with eyes that follow the mouse,
 * expressions that change on hover, and floating animation.
 */
export default function Mascot({ mousePos = { x: 0, y: 0 } }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [blink, setBlink] = useState(false)

  // Random blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 2500 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  // Click bounce
  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 400)
  }

  // Eye tracking — maps mouse position to eye movement
  const eyeX = mousePos.x * 4
  const eyeY = mousePos.y * 3

  // Pupil size changes on hover
  const pupilSize = hovered ? 3.5 : 2.8
  const eyeHeight = blink ? 0.5 : (hovered ? 7 : 6)

  return (
    <div
      className="hidden lg:block absolute right-12 top-1/2 cursor-pointer select-none"
      style={{
        transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px) translateY(-50%) ${clicked ? 'scale(0.9)' : 'scale(1)'}`,
        transition: clicked ? 'transform 0.15s ease-out' : 'transform 0.3s ease-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <div className="relative w-64 h-64 flex items-center justify-center">

        {/* Glow behind mascot */}
        <div
          className="absolute w-40 h-40 rounded-full transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${hovered ? 'rgba(8, 196, 172, 0.2)' : 'rgba(8, 196, 172, 0.08)'}, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />

        {/* Shadow on ground */}
        <div
          className="absolute bottom-6 w-24 h-4 rounded-full bg-brand-500/10 blur-md transition-all duration-300"
          style={{ transform: `scaleX(${hovered ? 1.2 : 1})` }}
        />

        {/* Main body */}
        <svg
          viewBox="0 0 120 120"
          className="relative w-48 h-48 animate-float-slow drop-shadow-2xl"
          style={{ filter: `drop-shadow(0 8px 24px rgba(8, 196, 172, ${hovered ? '0.3' : '0.12'}))` }}
        >
          {/* Body shape — friendly blob */}
          <defs>
            <linearGradient id="mascot-body" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#20e0c5" />
              <stop offset="50%" stopColor="#08c4ac" />
              <stop offset="100%" stopColor="#049e8d" />
            </linearGradient>
            <linearGradient id="mascot-body-hover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52f5da" />
              <stop offset="50%" stopColor="#20e0c5" />
              <stop offset="100%" stopColor="#08c4ac" />
            </linearGradient>
            <radialGradient id="mascot-shine" cx="35%" cy="30%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff9ec6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff9ec6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Body */}
          <ellipse
            cx="60" cy="62" rx={hovered ? 38 : 36} ry={hovered ? 36 : 34}
            fill={hovered ? 'url(#mascot-body-hover)' : 'url(#mascot-body)'}
            className="transition-all duration-300"
          />

          {/* Body shine */}
          <ellipse cx="60" cy="62" rx="36" ry="34" fill="url(#mascot-shine)" />

          {/* Left ear/antenna */}
          <ellipse
            cx="38" cy="34" rx="8" ry="10"
            fill={hovered ? '#20e0c5' : '#08c4ac'}
            className="transition-colors duration-300"
            style={{ transform: `rotate(${hovered ? -15 : -10}deg)`, transformOrigin: '38px 44px' }}
          />
          <ellipse cx="38" cy="32" rx="4" ry="5" fill="#049e8d" opacity="0.3" />

          {/* Right ear/antenna */}
          <ellipse
            cx="82" cy="34" rx="8" ry="10"
            fill={hovered ? '#20e0c5' : '#08c4ac'}
            className="transition-colors duration-300"
            style={{ transform: `rotate(${hovered ? 15 : 10}deg)`, transformOrigin: '82px 44px' }}
          />
          <ellipse cx="82" cy="32" rx="4" ry="5" fill="#049e8d" opacity="0.3" />

          {/* Eyes — white */}
          <ellipse
            cx={48 + eyeX * 0.3} cy={56}
            rx="9" ry={eyeHeight}
            fill="white"
            className="transition-all duration-150"
          />
          <ellipse
            cx={72 + eyeX * 0.3} cy={56}
            rx="9" ry={eyeHeight}
            fill="white"
            className="transition-all duration-150"
          />

          {/* Pupils */}
          {!blink && (
            <>
              <circle
                cx={48 + eyeX} cy={57 + eyeY}
                r={pupilSize}
                fill="#1a1a2e"
                className="transition-all duration-100"
              />
              <circle
                cx={72 + eyeX} cy={57 + eyeY}
                r={pupilSize}
                fill="#1a1a2e"
                className="transition-all duration-100"
              />
              {/* Eye highlights */}
              <circle cx={46 + eyeX} cy={55 + eyeY} r="1.2" fill="white" />
              <circle cx={70 + eyeX} cy={55 + eyeY} r="1.2" fill="white" />
            </>
          )}

          {/* Cheeks */}
          <ellipse cx="36" cy="68" rx="7" ry="5" fill="url(#cheek)" opacity={hovered ? 0.8 : 0.4} className="transition-opacity duration-300" />
          <ellipse cx="84" cy="68" rx="7" ry="5" fill="url(#cheek)" opacity={hovered ? 0.8 : 0.4} className="transition-opacity duration-300" />

          {/* Mouth */}
          {hovered ? (
            /* Happy open mouth */
            <path
              d="M 52 72 Q 60 82 68 72"
              fill="#049e8d"
              stroke="#047a6e"
              strokeWidth="0.5"
            />
          ) : (
            /* Cute small smile */
            <path
              d="M 53 72 Q 60 78 67 72"
              fill="none"
              stroke="#047a6e"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}

          {/* Little arms */}
          <ellipse
            cx="26" cy={hovered ? 64 : 68} rx="6" ry="4"
            fill={hovered ? '#20e0c5' : '#08c4ac'}
            className="transition-all duration-300"
            style={{ transform: `rotate(${hovered ? -25 : -10}deg)`, transformOrigin: '32px 68px' }}
          />
          <ellipse
            cx="94" cy={hovered ? 64 : 68} rx="6" ry="4"
            fill={hovered ? '#20e0c5' : '#08c4ac'}
            className="transition-all duration-300"
            style={{ transform: `rotate(${hovered ? 25 : 10}deg)`, transformOrigin: '88px 68px' }}
          />

          {/* Feet */}
          <ellipse cx="48" cy="94" rx="10" ry="5" fill="#07b39b" />
          <ellipse cx="72" cy="94" rx="10" ry="5" fill="#07b39b" />
        </svg>

        {/* Speech bubble on hover */}
        <div
          className={`absolute -top-2 -right-2 bg-white rounded-2xl px-4 py-2 shadow-xl border border-gray-100 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}`}
        >
          <span className="text-sm font-display font-bold text-gray-800">Busca tu hogar</span>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
        </div>

        {/* Floating particles around mascot */}
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-brand-400/30 animate-float"
            style={{
              left: `${30 + i * 25}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * -2}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
