/**
 * Rate Limiting Middleware for API Routes
 * Prevents abuse and DDoS attacks
 */

import { NextResponse } from "next/server";

// In-memory store (for production, consider Redis)
const requestCounts = new Map();
const blockedIPs = new Map();

// Clean old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
    for (const [key, value] of blockedIPs.entries()) {
      if (now > value) {
        blockedIPs.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Rate limiter function
 * @param {object} options - Rate limit options
 * @returns {Function} Middleware function
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 100, // Max requests per window
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (request) => {
      return (
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
      );
    },
    handler = null, // Custom handler for rate limit exceeded
  } = options;

  return async (request) => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Check if IP is blocked
    const blockedUntil = blockedIPs.get(key);
    if (blockedUntil && now < blockedUntil) {
      const retryAfter = Math.ceil((blockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Your IP has been temporarily blocked due to excessive requests.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      });
      return null;
    }

    if (record.count >= max) {
      // Rate limit exceeded

      // Block IP if consistently hitting rate limit
      if (record.count >= max * 2) {
        const blockDuration = 60 * 60 * 1000; // Block for 1 hour
        blockedIPs.set(key, now + blockDuration);
      }

      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      if (handler) {
        return handler(request, retryAfter);
      }

      return NextResponse.json(
        {
          success: false,
          message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment count
    record.count++;
    const remaining = max - record.count;

    // Return headers for successful request
    request.rateLimitHeaders = {
      "X-RateLimit-Limit": max.toString(),
      "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
      "X-RateLimit-Reset": new Date(record.resetTime).toISOString(),
    };

    return null;
  };
}

// ========================================
// PRESET RATE LIMITERS
// ========================================

/**
 * Strict rate limiter for auth endpoints (login, register)
 * 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many authentication attempts. Please try again in 15 minutes.",
  handler: (request, retryAfter) => {
    // Custom handler for auth rate limit
    return NextResponse.json(
      {
        success: false,
        message:
          "Too many login attempts from this IP. Please try again later.",
        retryAfter,
        error: "RATE_LIMIT_AUTH",
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      }
    );
  },
});

/**
 * Moderate rate limiter for order creation
 * 10 requests per minute
 */
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many order requests. Please slow down.",
});

/**
 * Standard API rate limiter
 * 60 requests per minute
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many API requests. Please try again later.",
});

/**
 * Strict rate limiter for sensitive operations
 * 5 requests per minute
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Rate limit exceeded. Please wait before trying again.",
});

/**
 * Webhook rate limiter
 * 100 requests per minute (for payment notifications)
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (request) => {
    // Use order ID as key for webhooks
    const body = request.body;
    return body?.order_id || "webhook-unknown";
  },
});

/**
 * Upload rate limiter
 * 10 uploads per 5 minutes
 */
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: "Upload limit exceeded. Please wait before uploading again.",
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Apply rate limiter to API route
 * @param {Request} request - Next.js request object
 * @param {Function} limiter - Rate limiter function
 * @returns {Response|null} Response if rate limited, null otherwise
 */
export async function applyRateLimit(request, limiter) {
  try {
    const response = await limiter(request);
    return response;
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Don't block requests on rate limiter errors
    return null;
  }
}

/**
 * Get rate limit info for a key
 * @param {string} key - Key identifier
 * @returns {object} Rate limit info
 */
export function getRateLimitInfo(key) {
  const record = requestCounts.get(key);
  if (!record) {
    return { limited: false };
  }

  const now = Date.now();
  if (now > record.resetTime) {
    return { limited: false };
  }

  return {
    limited: true,
    count: record.count,
    resetTime: record.resetTime,
    remaining: Math.max(0, record.resetTime - now),
  };
}

/**
 * Clear rate limit for a key
 * @param {string} key - Key identifier
 */
export function clearRateLimit(key) {
  requestCounts.delete(key);
  blockedIPs.delete(key);
}

/**
 * Block an IP address
 * @param {string} ip - IP address to block
 * @param {number} duration - Block duration in milliseconds
 */
export function blockIP(ip, duration = 60 * 60 * 1000) {
  blockedIPs.set(ip, Date.now() + duration);
}

/**
 * Check if IP is blocked
 * @param {string} ip - IP address to check
 * @returns {boolean} True if blocked
 */
export function isIPBlocked(ip) {
  const blockedUntil = blockedIPs.get(ip);
  if (!blockedUntil) return false;
  const now = Date.now();
  if (now > blockedUntil) {
    blockedIPs.delete(ip);
    return false;
  }
  return true;
}
