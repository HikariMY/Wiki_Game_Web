import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Home, MessageSquare, Gamepad2, Skull } from "lucide-react";
import AuthButton from "@/components/AuthButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Wiki & Forum",
  description: "ศูนย์รวมข้อมูล Heaven Burns Red และ Path to Nowhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}
        suppressHydrationWarning
      >
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0 font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                <Link href="/">🎮 WIKI HUB</Link>
              </div>
              <div className="hidden md:flex flex-1 justify-center">
                <div className="flex items-baseline space-x-4">
                  <Link
                    href="/"
                    className="hover:bg-gray-700 px-3 py-2 rounded-md font-medium flex gap-2"
                  >
                    <Home size={20} /> เลือกเกม
                  </Link>
                  <Link
                    href="/hbr"
                    className="hover:bg-red-900/50 text-red-400 px-3 py-2 rounded-md font-medium flex gap-2"
                  >
                    <Gamepad2 size={20} /> Heaven Burns Red
                  </Link>
                  <Link
                    href="/ptn"
                    className="hover:bg-purple-900/50 text-purple-400 px-3 py-2 rounded-md font-medium flex gap-2"
                  >
                    <Skull size={20} /> Path to Nowhere
                  </Link>
                  <Link
                    href="/forum"
                    className="hover:bg-gray-700 px-3 py-2 rounded-md font-medium flex gap-2"
                  >
                    <MessageSquare size={20} /> ฟอรัมรวม
                  </Link>
                </div>
              </div>
              {/* ปุ่มล็อกอินจะอยู่มุมขวาบน */}
              <div className="hidden md:block">
                <AuthButton />
              </div>
            </div>
          </div>

          {/* ... โค้ดเมนูมือถือเดิม ... */}

          {/* เมนูมือถือ */}
          <div className="md:hidden fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 flex justify-around p-3 z-50">
            <Link
              href="/"
              className="flex flex-col items-center text-sm text-gray-400 hover:text-white"
            >
              <Home size={24} />
            </Link>
            <Link
              href="/hbr"
              className="flex flex-col items-center text-sm text-red-400 hover:text-red-300"
            >
              <Gamepad2 size={24} />
            </Link>
            <Link
              href="/ptn"
              className="flex flex-col items-center text-sm text-purple-400 hover:text-purple-300"
            >
              <Skull size={24} />
            </Link>
            <Link
              href="/forum"
              className="flex flex-col items-center text-sm text-gray-400 hover:text-white"
            >
              <MessageSquare size={24} />
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
