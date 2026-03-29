import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * 3D tilt effect that follows mouse position over an element.
 * Returns a ref to attach and a style object for the transform.
 */
export function useTilt3D(intensity = 12) {
  const ref = useRef(null)
  const [style, setStyle] = useState({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    transition: 'transform 0.15s ease-out',
  })

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = ((x - centerX) / centerX) * intensity
    const rotateX = ((centerY - y) / centerY) * intensity

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`,
      transition: 'transform 0.1s ease-out',
    })
  }, [intensity])

  const handleLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    })
  }, [])

  return { ref, style, onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/**
 * Mouse position tracker relative to an element, normalized -1 to 1.
 * Useful for parallax layers inside a container.
 */
export function useMouseParallax() {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame
    const handle = (e) => {
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        setPos({ x, y })
      })
    }

    const reset = () => setPos({ x: 0, y: 0 })

    el.addEventListener('mousemove', handle, { passive: true })
    el.addEventListener('mouseleave', reset)
    return () => {
      el.removeEventListener('mousemove', handle)
      el.removeEventListener('mouseleave', reset)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return [ref, pos]
}

/**
 * Magnetic button effect — element follows cursor slightly when hovering.
 */
export function useMagnetic(strength = 0.3) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setOffset({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }, [strength])

  const handleLeave = useCallback(() => setOffset({ x: 0, y: 0 }), [])

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: offset.x === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out',
  }

  return { ref, style, onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/**
 * Animated gradient orbs that move based on scroll position.
 */
export function FloatingOrbs({ count = 3, className = '' }) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 120 + Math.random() * 200,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * -20,
    hue: 170 + Math.random() * 20,
  }))

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map(orb => (
        <div
          key={orb.id}
          className="absolute rounded-full animate-orb-drift"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(circle, hsla(${orb.hue}, 80%, 55%, 0.12) 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Interactive grid background that responds to mouse.
 */
export function InteractiveGrid({ mousePos }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="grid-glow" cx={`${50 + (mousePos?.x || 0) * 20}%`} cy={`${50 + (mousePos?.y || 0) * 20}%`} r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-glow)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#grid-mask)" />
      </svg>
    </div>
  )
}
