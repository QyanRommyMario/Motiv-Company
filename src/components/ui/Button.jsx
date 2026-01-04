/**
 * Button Component - Modern Design
 * Reusable button with variants
 * Maintains consistent size during loading state
 */

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  ...props
}) {
  const baseStyles =
    "px-6 py-3 uppercase tracking-widest text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative min-h-[48px]";

  const variants = {
    primary: "bg-[#1A1A1A] text-white hover:opacity-90",
    secondary:
      "bg-white text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
    outline:
      "border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
    danger: "bg-[#EF4444] text-white hover:bg-[#DC2626]",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {/* Invisible children to maintain button width */}
      <span className={loading ? "invisible" : "visible"}>
        {children}
      </span>
      
      {/* Loading spinner overlay */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </span>
      )}
    </button>
  );
}
