import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function ForumHub() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <MessageSquare size={64} className="text-blue-500 mb-6" />
      <h1 className="text-4xl font-black mb-4 text-white">เลือกเว็บบอร์ด</h1>
      <p className="text-xl text-gray-400 mb-12">
        คุณต้องการเข้าไปพูดคุยในฟอรัมของเกมไหน?
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl justify-center">
        {/* ทางเข้าบอร์ด HBR */}
        <Link
          href="/forum/hbr"
          className="flex-1 bg-gray-800 hover:bg-red-900/40 border-2 border-red-900/50 hover:border-red-500 p-8 rounded-2xl transition-all duration-300 group"
        >
          <h2 className="text-2xl font-bold text-white group-hover:text-red-400 mb-2">
            Heaven Burns Red
          </h2>
          <p className="text-gray-400 text-sm">
            พูดคุยเนื้อเรื่อง จัดทีม และเทคนิคการเล่น
          </p>
        </Link>

        {/* ทางเข้าบอร์ด PTN */}
        <Link
          href="/forum/ptn"
          className="flex-1 bg-gray-800 hover:bg-purple-900/40 border-2 border-purple-900/50 hover:border-purple-500 p-8 rounded-2xl transition-all duration-300 group"
        >
          <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 mb-2">
            Path to Nowhere
          </h2>
          <p className="text-gray-400 text-sm">
            พูดคุยเนื้อเรื่อง จัดทีม และเทคนิคการเล่น
          </p>
        </Link>
      </div>
    </div>
  );
}
