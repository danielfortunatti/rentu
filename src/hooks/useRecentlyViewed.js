import { useState, useCallback } from 'react'

const STORAGE_KEY = 'rentu_recently_viewed'
const MAX_ITEMS = 8

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState(getStored)

  const addToRecentlyViewed = useCallback((property) => {
    const entry = {
      id: property.id,
      titulo: property.titulo,
      comuna: property.comuna,
      precio: property.precio,
      foto: property.foto || (property.fotos && property.fotos[0]) || null,
      tipo: property.tipo,
    }

    const current = getStored()
    const filtered = current.filter((item) => item.id !== entry.id)
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setRecentlyViewed(updated)
  }, [])

  return { recentlyViewed, addToRecentlyViewed }
}
