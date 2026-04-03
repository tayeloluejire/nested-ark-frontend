import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

export const metadata: Metadata = {
  title: "Nested Ark OS | Infrastructure Investment System",
  description: "Advanced global infrastructure project and capital management operating system.",
  icons: {
    icon: "/favicon.ico", // Standard favicon
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Optional: if you have a touch icon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        {/* Manual fallback for older browsers */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased min-h-screen bg-[#050505] text-white flex flex-col">
        <AuthProvider>
          {/* Main content expands to fill available space */}
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}