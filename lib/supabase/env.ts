// Resolve Supabase public config. Prefers env (either the new "anon" var name
// or the older "publishable" name); falls back to the project's public values so
// the browser/server client always constructs even when Vercel env is missing.
//
// These two values are PUBLIC by design — the publishable/anon key is meant to be
// shipped to browsers and is protected by row-level security. The secret service-
// role key is NOT here (it stays server-only via SUPABASE_SERVICE_ROLE_KEY).
const FALLBACK_URL = "https://bzqudhqkfwyksdugxtqb.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_mXC8TpV0ah2bECMlUy44lA_viOEKFG-";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  FALLBACK_ANON_KEY;
