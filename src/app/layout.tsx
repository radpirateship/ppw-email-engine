import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPW Email Engine",
  description:
    "Email marketing command center for Peak Primal Wellness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-ppw-dark text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
