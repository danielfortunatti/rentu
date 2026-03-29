import { useState, useCallback } from 'react'
import { createElement } from 'react'
import Toast from '../components/Toast'

let toastId = 0

export default function useToast() {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toastContainer = toasts.length > 0
    ? createElement(
        'div',
        {
          className: 'fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none',
          style: { maxWidth: '360px' },
        },
        toasts.map(t =>
          createElement(Toast, {
            key: t.id,
            id: t.id,
            message: t.message,
            type: t.type,
            onClose: removeToast,
          })
        )
      )
    : null

  return { toast: toastContainer, showToast }
}
