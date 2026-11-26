import { notFound } from "next/navigation";
import { AuthForm } from "../../../../components/auth";
import { dataMode, supabaseConfig } from "../../../../lib/settings";
export default async function Page({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (kind !== "pessoa" && kind !== "empresa") notFound();
  return (
    <AuthForm
      kind={kind}
      configured={dataMode === "supabase" && !!supabaseConfig()}
    />
  );
}
