import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Swords, Zap } from "lucide-react";

export const revalidate = 0;

export default async function HBRDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ดึงข้อมูลตัวละครพร้อมจอยตาราง attack_types
  const { data: char } = await supabase
    .from("characters")
    .select("*, attack_types(*)")
    .eq("id", id)
    .single();
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("character_id", id)
    .order("created_at", { ascending: true });

  if (!char)
    return (
      <div className="text-center py-20 text-white font-bold">
        ไม่พบข้อมูลตัวละคร ❌
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link
        href="/hbr"
        className="inline-flex items-center text-gray-400 hover:text-red-400 mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2" /> กลับไปหน้าเลือกตัวละคร
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/5">
          <img
            src={char.image_url}
            alt={char.name}
            className="w-full rounded-3xl border border-red-900/50 shadow-2xl"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            {/* แสดงโลโก้รูปภาพที่คุณอัปโหลดและเลือกไว้ */}
            {char.attack_types?.icon_url && (
              <img
                src={char.attack_types.icon_url}
                alt="attack-type"
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            )}
            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">
              {char.name}
            </h1>
          </div>

          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 border-b-4 border-red-600 w-fit pb-2">
            <Swords className="text-red-500" /> Battle Skills
          </h2>

          <div className="space-y-6">
            {skills?.map((skill) => (
              <div
                key={skill.id}
                className="bg-gray-800/40 rounded-2xl border border-gray-700 p-6 hover:bg-gray-800 transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-2xl font-bold text-white">
                    {skill.name_th}
                  </h4>
                  {skill.sp_cost && (
                    <div className="bg-blue-600 px-4 py-2 rounded-xl text-white font-black flex items-center gap-2">
                      <Zap size={16} fill="white" /> SP {skill.sp_cost}
                    </div>
                  )}
                </div>
                <p className="text-gray-300 bg-black/20 p-4 rounded-xl border-l-4 border-red-500 leading-relaxed">
                  {skill.description_th || "รอการอัปเดตบทแปลภาษาไทยจากสตรีม..."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
