/**
 * Loading Component
 * Display loading spinner with multiple variants
 * Default: centered in parent container
 */

export default function Loading({
  size = "md",
  fullScreen = false,
  text = null,
  variant = "default", // default, overlay, inline, centered
}) {
  const sizes = {
    xs: "w-3 h-3 border-2",
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const spinner = (
    <div
      className={`${sizes[size]} border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin`}
    />
  );

  // Fullscreen loading overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#1A1A1A] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-[#6B7280] uppercase tracking-widest">
            {text || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Overlay variant (for sections)
  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          {spinner}
          {text && (
            <p className="mt-2 text-xs text-[#6B7280] uppercase tracking-wider">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline variant (for buttons, small areas)
  if (variant === "inline") {
    return (
      <span className="inline-flex items-center gap-2">
        {spinner}
        {text && <span className="text-sm">{text}</span>}
      </span>
    );
  }

  // Default: centered in container with flex
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="text-center">
        {spinner}
        {text && (
          <p className="mt-3 text-xs text-[#6B7280] uppercase tracking-wider">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Skeleton loading component for content placeholders
export function Skeleton({
  className = "",
  variant = "text", // text, circle, rect, card
}) {
  const baseClass =
    "animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]";

  const variants = {
    text: "h-4 rounded",
    circle: "rounded-full",
    rect: "rounded",
    card: "rounded-lg",
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-[#E5E7EB] overflow-hidden">
      <Skeleton variant="rect" className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="w-1/3 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />
        <div className="pt-2">
          <Skeleton className="w-1/2 h-5" />
        </div>
      </div>
    </div>
  );
}

// Grid of product skeletons
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
      role="status"
      aria-label="Loading products"
      aria-busy="true"
    >
      <span className="sr-only">Loading products, please wait...</span>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
