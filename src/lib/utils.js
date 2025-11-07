// Format currency to IDR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  };
  return date.toLocaleDateString("id-ID", defaultOptions);
};

// Format date with time
export const formatDateTime = (dateString) => {
  return formatDate(dateString, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get relative time (e.g., "2 jam yang lalu")
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  } else {
    return formatDate(dateString);
  }
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

// Calculate discount
export const calculateDiscount = (originalPrice, discountPercent) => {
  return originalPrice * (discountPercent / 100);
};

// Calculate final price after discount
export const calculateFinalPrice = (originalPrice, discountPercent) => {
  return originalPrice - calculateDiscount(originalPrice, discountPercent);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indonesian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return "";
  // Remove spaces and convert to string
  const cleaned = phone.toString().replace(/\s/g, "");

  // Format: 0812-3456-7890
  if (cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return cleaned;
};

// Slugify text (for URLs)
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Calculate pagination
export const getPaginationRange = (currentPage, totalPages, delta = 2) => {
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  });

  return rangeWithDots;
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
