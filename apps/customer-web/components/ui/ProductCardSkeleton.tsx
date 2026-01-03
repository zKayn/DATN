export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 relative">
        <div className="absolute inset-0 skeleton" />
      </div>

      {/* Product Info Skeleton */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Product Name */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full skeleton" />
          <div className="h-4 bg-gray-200 rounded w-2/3 skeleton" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded skeleton" />
            ))}
          </div>
          <div className="h-3 w-12 bg-gray-200 rounded skeleton" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded skeleton" />
          <div className="h-4 w-16 bg-gray-200 rounded skeleton" />
        </div>

        {/* Sold Count */}
        <div className="h-3 w-20 bg-gray-200 rounded skeleton" />
      </div>
    </div>
  )
}
