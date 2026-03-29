export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-10 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-14 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonPropertyDetail() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonText({ width = 'w-full', className = '' }) {
  return <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width} ${className}`} />
}
