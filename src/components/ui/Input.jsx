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
      <input
        type={type}
        className={`
          w-full px-4 py-3 border
          text-[#1A1A1A] placeholder:text-[#9CA3AF]
          focus:outline-none focus:border-[#1A1A1A] transition-colors
          ${error ? "border-red-500" : "border-[#E5E7EB]"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
