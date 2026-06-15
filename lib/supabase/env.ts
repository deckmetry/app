// Supabase public config (URL + publishable/anon key).
//
// These are pinned to the project's known-good PUBLIC values. They are public by
// design — the publishable key is shipped to browsers and protected by row-level
// security. We pin them (rather than read NEXT_PUBLIC_* env) because the Vercel
// build was serving a missing/incorrect key, which broke login. The secret
// service-role key is NOT here — it stays server-only via SUPABASE_SERVICE_ROLE_KEY.
//
// If the project's URL or publishable key is ever rotated, update these constants.
export const SUPABASE_URL = "https://bzqudhqkfwyksdugxtqb.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_mXC8TpV0ah2bECMlUy44lA_viOEKFG-";
