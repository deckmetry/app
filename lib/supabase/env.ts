// Resolve Supabase public config from env, accepting either the new
// "anon" var name or the older "publishable" name. Whichever is set on the
// host (local .env.local or Vercel) is used — avoids a stuck login when only
// one of the two names is configured.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
