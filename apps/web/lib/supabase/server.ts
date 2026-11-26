import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "../settings";
export async function serverSupabase() {
  const config = supabaseConfig();
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(entries) {
        try {
          for (const { name, value, options } of entries)
            jar.set(name, value, options);
        } catch {
          /* Server Components rely on Proxy for refresh. */
        }
      },
    },
  });
}
