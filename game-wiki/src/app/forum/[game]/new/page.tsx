import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  MessageSquarePlus,
  Clock,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

export const revalidate = 0;

export default async function GameForum({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const gameCode = resolvedParams.game.toUpperCase();
  const currentCategory = resolvedSearchParams.category || "ทั้งหมด";

  let query = supabase
    .from("posts")
    .select("*")
    .eq("game", gameCode)
    .order("created_at", { ascending: false });

  if (currentCategory !== "ทั้งหมด") {
    query = query.eq("category", currentCategory);
  }

  const { data: posts } = await query;

  const isHBR = gameCode === "HBR";
  const gameName = isHBR ? "Heaven Burns Red" : "Path to Nowhere";
  const colorClass = isHBR ? "text-red-400" : "text-purple-400";
  const borderClass = isHBR ? "border-red-500" : "border-purple-500";
  const bgHoverClass = isHBR ? "hover:bg-red-600" : "hover:bg-purple-600";

  const categories = ["ทั้งหมด", "ทั่วไป", "เกมเพลย์", "เนื้อเรื่อง", "จัดทีม"];

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/forum"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> กลับไปหน้าเลือกเว็บบอร์ด
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className={`text-3xl font-black drop-shadow-md ${colorClass}`}>
            ฟอรัม: {gameName}
          </h1>
        </div>
        <Link
          href={`/forum/${gameCode.toLowerCase()}/new`}
          className={`bg-gray-800 border ${borderClass} text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${bgHoverClass} shadow-lg`}
        >
          <MessageSquarePlus size={20} />
          ตั้งกระทู้ใหม่
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-gray-800 p-2 rounded-xl border border-gray-700">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/forum/${gameCode.toLowerCase()}${cat === "ทั้งหมด" ? "" : `?category=${cat}`}`}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${currentCategory === cat ? (isHBR ? "bg-red-600 text-white" : "bg-purple-600 text-white") : "text-gray-400 hover:bg-gray-700"}`}
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden flex flex-col"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full bg-gray-900 border ${isHBR ? "border-red-900/50 text-red-400" : "border-purple-900/50 text-purple-400"}`}
                  >
                    {post.category || "ทั่วไป"}
                  </span>
                  <h2 className="text-2xl font-bold text-white">
                    {post.title}
                  </h2>
                </div>

                <p className="text-gray-300 line-clamp-3 mb-6">
                  {post.content}
                </p>

                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mt-auto">
                  <span className="font-medium text-blue-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                    โดย: {post.author_email || "ผู้ใช้งานทั่วไป"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(post.created_at).toLocaleDateString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {post.image_url && (
                <div className="md:w-1/3 shrink-0">
                  <img
                    src={post.image_url}
                    alt="ภาพประกอบกระทู้"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* ปุ่มกดเข้าไปอ่านรายละเอียดและคอมเมนต์ */}
            <div className="pt-4 border-t border-gray-700 flex justify-end mt-auto">
              <Link
                href={`/forum/${gameCode.toLowerCase()}/${post.id}`}
                className={`font-bold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg ${isHBR ? "bg-red-900/30 text-red-400 hover:bg-red-900/60" : "bg-purple-900/30 text-purple-400 hover:bg-purple-900/60"}`}
              >
                <MessageSquare size={18} />
                อ่านกระทู้ / คอมเมนต์
              </Link>
            </div>
          </div>
        ))}

        {(!posts || posts.length === 0) && (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700 text-gray-400 shadow-inner">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-xl font-bold text-white mb-2">
              ยังไม่มีกระทู้ในหมวดหมู่นี้
            </p>
            <p>มาเปิดประเด็นพูดคุยกันเถอะ!</p>
          </div>
        )}
      </div>
    </div>
  );
}
