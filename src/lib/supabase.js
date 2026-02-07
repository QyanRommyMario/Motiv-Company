import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Standard client for general operations (respects RLS policies)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client for privileged operations (bypasses RLS)
// Only use this for admin operations that need to bypass Row Level Security
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase; // Fallback to regular client if service key not available

// Helper to check if admin client is properly configured
export const hasAdminAccess = () => !!supabaseServiceKey;

// Log warning if service key is missing (only in development)
if (!supabaseServiceKey && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will use anon key (limited permissions)."
  );
}

export { supabase, supabaseAdmin };
export default supabase;
