import { useState, useEffect } from 'react'
import { createReview, getReviewsForUser, getUserRating } from '../lib/supabase'
import StarRating from './StarRating'

export default function ReviewSection({ userId, propertyId, currentUser }) {
  const [reviews, setReviews] = useState([])
  const [ratingInfo, setRatingInfo] = useState({ avg: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [formRating, setFormRating] = useState(0)
  const [formComment, setFormComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const isOwner = currentUser?.id === userId
  const canReview = currentUser && !isOwner

  async function loadReviews() {
    setLoading(true)
    setError(null)
    try {
      const [reviewsRes, ratingRes] = await Promise.all([
        getReviewsForUser(userId),
        getUserRating(userId),
      ])
      if (reviewsRes.error) throw reviewsRes.error
      setReviews(reviewsRes.data)
      setRatingInfo(ratingRes)
    } catch (err) {
      setError('No se pudieron cargar las valoraciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) loadReviews()
  }, [userId])

  async function handleSubmit(e) {
    e.preventDefault()
    if (formRating === 0) {
      setSubmitError('Selecciona una calificación.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    const { error } = await createReview({
      reviewer_id: currentUser.id,
      reviewed_user_id: userId,
      property_id: propertyId,
      rating: formRating,
      comment: formComment.trim(),
    })

    if (error) {
      setSubmitError(error.message || 'Error al enviar la valoración.')
    } else {
      setSubmitSuccess(true)
      setFormRating(0)
      setFormComment('')
      await loadReviews()
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Valoraciones del arrendador</h3>

      {/* Average rating summary */}
      {!loading && ratingInfo.count > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl text-gray-900">{ratingInfo.avg}</span>
            <StarRating rating={ratingInfo.avg} size="md" />
          </div>
          <span className="text-sm text-gray-500">
            {ratingInfo.count} {ratingInfo.count === 1 ? 'valoración' : 'valoraciones'}
          </span>
        </div>
      )}

      {!loading && ratingInfo.count === 0 && (
        <p className="text-sm text-gray-400 mb-6">Este arrendador aún no tiene valoraciones.</p>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={loadReviews} className="text-xs text-red-500 underline mt-1">Reintentar</button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Review form */}
      {canReview && (
        <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 mb-6 bg-gray-50/50">
          <p className="text-sm font-semibold text-gray-700 mb-3">Deja tu valoración</p>
          <div className="mb-3">
            <StarRating rating={formRating} size="lg" interactive onChange={setFormRating} />
          </div>
          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Comparte tu experiencia con este arrendador..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all resize-none"
          />
          {submitError && <p className="text-xs text-red-500 mt-1">{submitError}</p>}
          {submitSuccess && <p className="text-xs text-green-600 mt-1">Valoración enviada correctamente.</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-brand-500/20"
          >
            {submitting ? 'Enviando...' : 'Enviar valoración'}
          </button>
        </form>
      )}

      {!currentUser && !loading && (
        <p className="text-sm text-gray-400 mb-6 italic">Inicia sesión para dejar una valoración.</p>
      )}

      {/* Reviews list */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-brand-700 text-xs font-bold">
                      {(review.reviewer_name || review.reviewer_id || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {review.reviewer_name || 'Usuario'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed pl-10">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
