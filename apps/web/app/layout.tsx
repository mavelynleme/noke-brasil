import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { colors, radius, shadow } from "@noke/design-tokens";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Noke Brasil",
  description: "Cada centavo importa",
};
export default function Layout({ children }: { children: ReactNode }) {
  const style = {
    ...Object.fromEntries(
      Object.entries(colors).map(([key, value]) => ["--" + key, value]),
    ),
    "--cardRadius": radius.card + "px",
    "--inputRadius": radius.input + "px",
    "--shadow": shadow,
  } as CSSProperties;
  return (
    <html lang="pt-BR" style={style}>
      <body>{children}</body>
    </html>
  );
}
