import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dataMode, supabaseConfig } from "./lib/settings";
export async function proxy(request: NextRequest) {
  const settings = supabaseConfig();
  let response = NextResponse.next({ request });
  if (dataMode !== "supabase" || !settings) return response;
  const supabase = createServerClient(settings.url, settings.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(entries, headers) {
        for (const { name, value } of entries) request.cookies.set(name, value);
        const previous = response;
        response = NextResponse.next({ request, headers: previous.headers });
        for (const cookie of previous.cookies.getAll())
          response.cookies.set(cookie);
        for (const [key, value] of Object.entries(headers))
          response.headers.set(key, value);
        for (const { name, value, options } of entries)
          response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/app/:path*", "/empresa/:path*", "/login", "/cadastro/:path*"],
};
