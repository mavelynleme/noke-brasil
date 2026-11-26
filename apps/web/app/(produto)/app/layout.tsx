import type { ReactNode } from "react";
import { BottomNavigation } from "../../../components/navigation";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="page">{children}</main>
      <BottomNavigation />
    </>
  );
}
