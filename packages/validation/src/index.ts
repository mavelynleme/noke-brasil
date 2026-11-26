import { z } from "zod";
import { categories, dateKey, origins } from "@noke/domain";
const date = z.iso
  .date()
  .refine(
    (value) => new Date(value + "T12:00:00Z").toISOString().startsWith(value),
    "Informe uma data válida.",
  );
export const positiveMoney = z.coerce.number().finite().positive().max(999999);
export const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,24}$/, "Use de 3 a 24 letras minúsculas, números ou _.");
export function isCnpj(input: string) {
  const normalized = input.replace(/[./\s-]/g, "").toUpperCase();
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(normalized) || /^(.)\1+$/.test(normalized))
    return false;
  const digits = normalized.split("").map((char) => char.charCodeAt(0) - 48);
  const check = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce(
        (total, digit, index) =>
          total + digit * (2 + ((length - index - 1) % 8)),
        0,
      );
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return check(12) === digits[12] && check(13) === digits[13];
}
const signup = z.object({
  email: z.email("Informe um e-mail válido."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]{10,19}$/, "Informe um telefone válido.")
    .refine(
      (value) => /^\d{10,15}$/.test(value.replace(/\D/g, "")),
      "Informe um telefone válido.",
    ),
  username,
  password: z.string().min(8, "Use no mínimo 8 caracteres.").max(72),
});
export const personSignup = signup.extend({
  name: z.string().trim().min(2).max(80),
  surname: z.string().trim().min(2).max(80),
  birthDate: date.refine(
    (value) => value <= dateKey(),
    "Informe uma data de nascimento válida.",
  ),
});
export const businessSignup = signup.extend({
  company: z.string().trim().min(2).max(120),
  cnpj: z
    .string()
    .refine(isCnpj, "Informe um CNPJ válido.")
    .transform((value) => value.replace(/[./\s-]/g, "").toUpperCase()),
});
export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(1).max(72),
});
export const expenseSchema = z.object({
  value: positiveMoney,
  category: z.enum(categories),
  date,
  description: z.string().trim().max(160),
  origin: z.enum(origins),
});
export const itemName = z
  .string()
  .trim()
  .min(2, "Informe pelo menos 2 caracteres.")
  .max(100);
export function validImage(file: File) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
    file.size > 0 &&
    file.size <= 8 * 1024 * 1024
  );
}
