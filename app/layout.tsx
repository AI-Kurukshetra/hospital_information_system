import type { Metadata } from "next";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthland Centriq",
  description:
    "Modern hospital information system for critical access hospitals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
