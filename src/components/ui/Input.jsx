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
          w-full px-4 py-2 border rounded-lg
          text-gray-900 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
          ${error ? "border-red-500" : "border-gray-300"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
