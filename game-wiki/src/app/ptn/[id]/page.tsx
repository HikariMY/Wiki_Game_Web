import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Clock,
  Swords,
  Shield,
  Activity,
  Info,
} from "lucide-react";

export const revalidate = 0;

export default async function PTNCharacterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. ดึงข้อมูลตัวละคร
  const { data: char } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  // 2. ดึงข้อมูลสกิลพร้อมสเตตัส Energy และ Cooldown
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .eq("character_id", id)
    .order("created_at", { ascending: true });

  if (!char)
    return (
      <div className="text-center py-20 text-white">ไม่พบข้อมูล Sinner ❌</div>
    );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link
        href="/ptn"
        className="inline-flex items-center text-gray-400 hover:text-purple-400 mb-8 transition-colors group"
      >
        <ArrowLeft
          size={20}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />{" "}
        กลับไปหน้าสรุป Sinner
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* ฝั่งซ้าย: รูป Sinner */}
        <div className="lg:w-2/5">
          <div className="sticky top-24 rounded-3xl overflow-hidden border border-purple-900/50 shadow-2xl">
            <img
              src={char.image_url}
              alt={char.name}
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 p-8">
              <span className="bg-yellow-500 text-yellow-950 font-black px-4 py-1 rounded-full text-xl shadow-lg">
                Rank {char.rarity}
              </span>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: รายละเอียดสกิลและการแปลไทย */}
        <div className="flex-1">
          <h1 className="text-6xl font-black text-white mb-4 italic tracking-tighter">
            {char.name}
          </h1>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-900/30 border border-purple-500/50 px-4 py-1 rounded-lg text-purple-300 font-bold uppercase tracking-widest text-sm">
              Role: {char.role}
            </div>
          </div>

          <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 mb-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Info size={14} /> Interrogation Files / ประวัติ
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {char.description}
            </p>
          </div>

          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <Activity className="text-purple-400" /> Skill Information
          </h2>

          <div className="space-y-6">
            {skills?.map((skill) => (
              <div
                key={skill.id}
                className="bg-gray-800/80 rounded-2xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center border border-purple-500/20">
                        {skill.icon_url ? (
                          <img src={skill.icon_url} className="w-12 h-12" />
                        ) : (
                          <Zap className="text-purple-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-white leading-tight">
                          {skill.name_th || skill.name_en}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                          {skill.type}
                        </p>
                      </div>
                    </div>

                    {/* ข้อมูล Energy และ CD เฉพาะ PTN */}
                    <div className="flex gap-2">
                      {skill.energy_cost && (
                        <div className="bg-purple-900/50 border border-purple-400/30 px-3 py-1.5 rounded-lg text-xs font-black text-purple-200 flex items-center gap-2">
                          <Zap size={12} className="fill-purple-300" /> ENERGY:{" "}
                          {skill.energy_cost}
                        </div>
                      )}
                      {skill.cooldown && (
                        <div className="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-black text-gray-400 flex items-center gap-2">
                          <Clock size={12} /> CD: {skill.cooldown}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30 border-l-4 border-l-purple-500">
                      <p className="text-gray-200 leading-relaxed">
                        {skill.description_th || "กำลังแปลข้อมูลภาษาไทย..."}
                      </p>
                    </div>
                    {skill.description_en && (
                      <p className="text-gray-500 text-xs italic px-2">
                        Original: {skill.description_en}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
