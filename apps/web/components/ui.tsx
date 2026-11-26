"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { money, periodLabels, periods, type Period } from "@noke/domain";
export function Button({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={"button " + className} {...props} />;
}
export function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link className={"button " + (secondary ? "secondary" : "")} href={href}>
      {children}
    </Link>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={"card " + className}>{children}</section>;
}
export function Money({ cents }: { cents: number }) {
  return <>{money(cents)}</>;
}
export function PageHeader({ title, back }: { title: string; back?: string }) {
  const router = useRouter();
  return (
    <header className="row">
      {back ? (
        <Link href={back} className="icon" aria-label="Voltar">
          <ArrowLeft size={20} />
        </Link>
      ) : (
        <button
          type="button"
          className="icon"
          aria-label="Voltar"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1>{title}</h1>
    </header>
  );
}
export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
export function PeriodSelector({
  value,
  onChange,
  budget = false,
}: {
  value: Period;
  onChange: (period: Period) => void;
  budget?: boolean;
}) {
  return (
    <div className="periods" role="group" aria-label="Período">
      {periods
        .filter((period) => !budget || period !== "year")
        .map((period) => (
          <button
            type="button"
            key={period}
            aria-pressed={value === period}
            onClick={() => onChange(period)}
          >
            {periodLabels[period]}
          </button>
        ))}
    </div>
  );
}
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="muted">{children}</p>;
}
export function ErrorState({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="error">
      {children}
    </p>
  );
}
export function LoadingState({ children }: { children: ReactNode }) {
  return <p role="status">{children}</p>;
}
export function ProgressBar({
  fraction,
  label,
}: {
  fraction: number;
  label: string;
}) {
  return (
    <progress
      className="meter"
      max={1}
      value={Math.min(1, fraction)}
      aria-label={label}
    />
  );
}
export function Sheet({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} aria-label={title} onCancel={close}>
      <div className="stack">
        <header className="row between">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon"
            aria-label="Fechar"
            onClick={close}
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
