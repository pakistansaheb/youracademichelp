import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-border bg-card shadow-sm shadow-black/[0.02] ${className}`}
      {...props}
    />
  );
}
