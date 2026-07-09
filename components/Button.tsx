"use client";

import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 px-7 py-3.5 text-[15px] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
  const styles = {
    primary: "bg-orange text-[#1A140A] shadow-glow hover:brightness-110",
    secondary: "bg-surface2 text-warm border border-white/10 hover:border-orange/50",
    ghost: "text-muted hover:text-warm",
  }[variant];

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
