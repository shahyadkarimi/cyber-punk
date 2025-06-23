import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/hooks/use-auth";
// import { AuthProvider } from "@/lib/auth-context"

// Configure the JetBrains Mono font with the weights we need
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TRXSecurity | Advanced Security Tools",
  description:
    "A comprehensive collection of web shells, security tools, and exploits for cybersecurity research and penetration testing.",
  keywords:
    "web shells, security tools, exploits, cybersecurity, penetration testing, ethical hacking, TRXSecurity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.className} bg-[#0d0d0f] text-gray-200 min-h-screen flex flex-col`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="matrix-bg absolute inset-0 opacity-10"></div>
        </div>
        <AuthProvider>
          <Header />
          <div className="flex-grow relative z-10">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
