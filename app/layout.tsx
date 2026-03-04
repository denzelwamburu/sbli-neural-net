import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scramjet Digital Twin — SBLI Research Platform",
  description: "Browser-based digital twin demonstrating real-time parametric scramjet intake visualisation with physically accurate shock systems. PhD Research: Discontinuity-Aware Neural Operators for Multi-Fidelity SBLI Prediction.",
  keywords: ["scramjet", "digital twin", "SBLI", "hypersonic", "neural operator", "computational fluid dynamics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'var(--font-sans)' }}>
        {children}
      </body>
    </html>
  );
}
