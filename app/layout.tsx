import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chef AI — Cocina Sin Estrés",
  description: "Tu Chef AI resuelve qué cocinar hoy en menos de un minuto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF6EE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans bg-bg text-warm min-h-screen">{children}</body>
    </html>
  );
}
