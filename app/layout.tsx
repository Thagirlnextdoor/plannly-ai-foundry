import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plannly — Today",
  description: "Big goals. Small steps. Real progress.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
