import Link from "next/link";
import type { ReactNode } from "react";
import { dataMode } from "../../lib/settings";
import { DemoProvider } from "../../lib/state";
import { serverSupabase } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: ReactNode }) {
  if (dataMode !== "mock") {
    const client = await serverSupabase();
    if (client) {
      const { data } = await client.auth.getClaims();
      if (!data?.claims) redirect("/login");
    }
    return (
      <main className="page">
        <h1>Configuração do Noke Brasil</h1>
        <p>
          O repositório de dados Supabase ainda precisa ser conectado. Use o
          modo de demonstração para experimentar o aplicativo.
        </p>
      </main>
    );
  }
  return (
    <DemoProvider>
      <header className="toolbar">
        <div className="row between">
          <Link className="logo" href="/app">
            noke <span>Brasil</span>
          </Link>
          <small>Modo demonstração</small>
        </div>
      </header>
      {children}
    </DemoProvider>
  );
}
