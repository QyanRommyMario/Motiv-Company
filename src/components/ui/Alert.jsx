/**
 * Alert Component
 * Display success, error, warning, or info messages
 */

export default function Alert({ type = "info", message, onClose }) {
  const types = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  if (!message) return null;

  return (
    <div
      className={`p-4 border rounded-lg flex items-center justify-between ${types[type]}`}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3">{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 ml-4"
        >
          ✕
        </button>
      )}
    </div>
  );
}
