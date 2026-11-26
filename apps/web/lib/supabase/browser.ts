import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "../settings";
export function browserSupabase() {
  const config = supabaseConfig();
  return config ? createBrowserClient(config.url, config.key) : null;
}
