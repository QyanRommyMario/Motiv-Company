/**
 * Input Component
 * Reusable input field with label and error handling
 */

export default function Input({
  label,
  type = "text",
  error,
  className = "",
  required = false,
  rightIcon,
  onRightIconClick,
  ...props
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`
            w-full px-4 py-3 border
            text-[#1A1A1A] placeholder:text-[#9CA3AF]
            focus:outline-none focus:border-[#1A1A1A] transition-colors
            ${error ? "border-red-500" : "border-[#E5E7EB]"}
            ${rightIcon ? "pr-12" : ""}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {rightIcon}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
