import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Lanark Community Club",
    default: "Lanark Community Club",
  },
  description:
    "The Lanark Community Club is a community organization in Lanark, Illinois dedicated to local improvement, events, and neighbor connection.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased">
        <Providers session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
