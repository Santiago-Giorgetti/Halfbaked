import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestor de Tickets",
  description: "Gestión personal de tickets de desarrollo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 md:px-8">{children}</main>
      </body>
    </html>
  );
}
