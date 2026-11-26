"use server";
import {
  businessSignup,
  loginSchema,
  personSignup,
  validImage,
} from "@noke/validation";
import { redirect } from "next/navigation";
import { dataMode } from "./settings";
import { serverSupabase } from "./supabase/server";
export async function authenticate(
  kind: "login" | "pessoa" | "empresa",
  _previous: string,
  form: FormData,
) {
  const fields = Object.fromEntries(form);
  if (kind === "login") {
    const result = loginSchema.safeParse(fields);
    if (!result.success) return result.error.issues[0].message;
    if (dataMode === "mock") redirect("/app");
    const client = await serverSupabase();
    if (!client) return "Configure o Supabase para entrar.";
    const { error } = await client.auth.signInWithPassword(result.data);
    if (error) return "Confira seu e-mail e sua senha.";
    redirect("/app");
  }
  const photo = fields.photo;
  if (photo instanceof File && photo.size && !validImage(photo))
    return "Use uma imagem JPEG, PNG ou WebP de até 8 MB.";
  const result =
    kind === "pessoa"
      ? personSignup.safeParse(fields)
      : businessSignup.safeParse(fields);
  if (!result.success) return result.error.issues[0].message;
  if (dataMode === "mock") redirect(kind === "pessoa" ? "/app" : "/empresa");
  return "O cadastro persistente aguarda a integração do perfil com a confirmação de e-mail.";
}
