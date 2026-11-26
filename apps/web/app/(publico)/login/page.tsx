import { AuthForm } from "../../../components/auth";
import { dataMode, supabaseConfig } from "../../../lib/settings";
export default function Page() {
  return (
    <AuthForm
      kind="login"
      configured={dataMode === "supabase" && !!supabaseConfig()}
    />
  );
}
