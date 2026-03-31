import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'rentu_onboarding_done'

const steps = [
  {
    title: 'Busca tu arriendo ideal',
    subtitle: 'Filtra por comuna, precio, dormitorios y más',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: 'Contacto directo',
    subtitle: 'Habla con el dueño por WhatsApp, sin intermediarios',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    title: 'Contrato gratis',
    subtitle: 'Genera tu contrato de referencia de arriendo al instante',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
]

export default function Onboarding() {
  const [visible, setVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0) // -1 = left, 1 = right
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) {
        setVisible(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage unavailable
    }
  }, [])

  const goToStep = useCallback((nextIndex) => {
    if (animating || nextIndex === currentStep) return
    setDirection(nextIndex > currentStep ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setCurrentStep(nextIndex)
      setAnimating(false)
    }, 250)
  }, [animating, currentStep])

  const handleNext = useCallback(() => {
    if (currentStep === steps.length - 1) {
      dismiss()
    } else {
      goToStep(currentStep + 1)
    }
  }, [currentStep, dismiss, goToStep])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      handleNext()
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      goToStep(currentStep - 1)
    } else if (e.key === 'Escape') {
      dismiss()
    }
  }, [handleNext, currentStep, goToStep, dismiss])

  useEffect(() => {
    if (!visible) return
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visible, handleKeyDown])

  if (!visible) return null

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  return (
    <div
      role="dialog"
      aria-label="Bienvenido a Rentu"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-md bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Skip link */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-sm text-white/60 hover:text-white/90 transition-colors z-10"
          aria-label="Saltar introducción"
        >
          Saltar
        </button>

        {/* Content area */}
        <div className="px-8 pt-12 pb-8">
          <div
            className={`flex flex-col items-center text-center transition-all duration-250 ease-in-out ${
              animating
                ? `opacity-0 ${direction > 0 ? 'translate-x-8' : '-translate-x-8'}`
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#049e8d]/20 flex items-center justify-center text-[#049e8d] mb-6">
              {step.icon}
            </div>

            {/* Title */}
            <h2 className="font-display font-bold text-2xl text-white mb-2">
              {step.title}
            </h2>

            {/* Subtitle */}
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="px-8 pb-8 flex flex-col items-center gap-5">
          {/* Navigation dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Pasos de introducción">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                role="tab"
                aria-selected={i === currentStep}
                aria-label={`Paso ${i + 1} de ${steps.length}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-8 h-2 bg-[#049e8d]'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={handleNext}
            className="w-full py-3 bg-[#049e8d] hover:bg-[#038578] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#049e8d]/30 text-sm"
          >
            {isLast ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
