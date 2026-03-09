import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  ArrowLeft,
  Swords,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowUpCircle,
  Component,
} from "lucide-react";

export const revalidate = 0;

export default async function HBRCharacterDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. ดึงข้อมูลตัวละคร
  const { data: char } = await supabase
    .from("characters")
    .select(
      `
      *, 
      hbr_classes(*), 
      attack_types(*), 
      element1:elements!element1_id(*), 
      element2:elements!element2_id(*)
    `,
    )
    .eq("id", id)
    .single();

  // 2. ดึงข้อมูลสกิล/อะบิลิตี้
  const { data: skills } = await supabase
    .from("skills")
    .select("*, elements(*), attack_types(*)")
    .eq("character_id", id)
    .order("created_at", { ascending: true });

  // 3. ดึงข้อมูล Limit Break
  const { data: limitBreaks } = await supabase
    .from("hbr_limit_breaks")
    .select("*")
    .eq("character_id", id)
    .order("tier", { ascending: true });

  if (!char)
    return (
      <div className="text-center py-20 text-white font-bold">
        ไม่พบข้อมูล Style ❌
      </div>
    );

  // แยกหมวดหมู่ข้อมูล
  const exSkills =
    skills?.filter((s) => s.type === "EX Skill" || s.type === "Ultimate") || [];
  const normalSkills =
    skills?.filter((s) => s.type === "Skill" || s.type === "Active") || [];
  const passiveSkills = skills?.filter((s) => s.type === "Passive") || [];
  const initialAbilities =
    skills?.filter((s) => s.type === "Initial Ability") || [];
  const orbAbilities = skills?.filter((s) => s.type === "Orb Ability") || [];

  // Component ย่อยสำหรับเรนเดอร์การ์ดสกิล
  const renderSkillCard = (skill: any, isEx: boolean = false) => (
    <div
      key={skill.id}
      className={`bg-gray-800/80 rounded-xl border overflow-hidden mb-6 shadow-xl ${isEx ? "border-orange-500/50 border-l-[6px] border-l-orange-500" : skill.type === "Passive" ? "border-gray-600 border-l-4 border-l-gray-400" : "border-gray-700 border-l-4 border-l-red-500"}`}
    >
      <div
        className={`p-4 border-b ${isEx ? "bg-orange-950/40 border-orange-900/50" : skill.type === "Passive" ? "bg-gray-900/80 border-gray-700" : "bg-gray-900/50 border-gray-700"}`}
      >
        <h4
          className={`text-xl font-bold flex items-center gap-2 ${isEx ? "text-orange-400" : skill.type === "Passive" ? "text-gray-300" : "text-pink-400"}`}
        >
          {isEx
            ? "【สกิล EX】"
            : skill.type === "Passive"
              ? "【Passive】"
              : "【สกิล】"}{" "}
          {skill.name_th || skill.name_en}
        </h4>
      </div>

      {/* โชว์แถบธาตุ/SP เฉพาะสกิลที่มีการตั้งค่าไว้ (Passive มักจะไม่มี SP) */}
      {(skill.elements || skill.attack_types || skill.sp_cost) && (
        <div className="flex flex-wrap items-center gap-6 p-4 border-b border-gray-700/50 bg-gray-900/80 text-sm font-bold text-gray-300">
          {(skill.elements || skill.attack_types) && (
            <div className="flex items-center gap-2">
              <span>【รูปแบบการโจมตี】</span>
              {skill.elements && (
                <img
                  src={skill.elements.icon_url}
                  className="w-6 h-6 object-contain drop-shadow"
                  title={skill.elements.name}
                  alt={skill.elements.name}
                />
              )}
              {skill.attack_types && (
                <img
                  src={skill.attack_types.icon_url}
                  className="w-6 h-6 object-contain drop-shadow"
                  title={skill.attack_types.name}
                  alt={skill.attack_types.name}
                />
              )}
            </div>
          )}
          {skill.sp_cost && (
            <div className="flex items-center gap-2">
              <span>【SPที่ใช้】</span>
              <span className="text-white text-base">{skill.sp_cost}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        <div>
          <p className="font-bold text-gray-400 mb-2">ผลลัพธ์ของสกิล</p>
          <p className="text-gray-200 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-lg border-l-2 border-pink-500/50">
            {skill.description_th || "รอการอัปเดตบทแปลภาษาไทย..."}
          </p>
        </div>
        {skill.description_en && (
          <div>
            <p className="font-bold text-gray-400 mb-2">
              【詳細情報】 (ข้อมูลเชิงลึก)
            </p>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-lg font-mono">
              {skill.description_en}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link
        href="/hbr"
        className="inline-flex items-center text-gray-400 hover:text-red-400 mb-8 transition-colors group"
      >
        <ArrowLeft
          size={20}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />{" "}
        กลับไปหน้าเลือก Style
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* ===================== กรอบรูป Style ===================== */}
        <div className="lg:w-2/5">
          <div className="sticky top-24 rounded-3xl overflow-hidden border border-red-900/50 shadow-2xl relative">
            <img
              src={char.image_url}
              alt={char.name}
              className="w-full h-auto object-cover"
            />
            {char.attack_types?.icon_url && (
              <div className="absolute top-4 left-4 bg-gray-900/50 p-1.5 rounded-full backdrop-blur-sm border border-gray-600/30 shadow-lg">
                <img
                  src={char.attack_types.icon_url}
                  className="w-12 h-12 object-contain"
                  alt="attack type"
                />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              {char.element1 && (
                <div className="bg-gray-900/50 p-1.5 rounded-full backdrop-blur-sm border border-gray-600/30 shadow-lg">
                  <img
                    src={char.element1.icon_url}
                    className="w-10 h-10 object-contain"
                    title={char.element1.name}
                    alt="element1"
                  />
                </div>
              )}
              {char.element2 && (
                <div className="bg-gray-900/50 p-1.5 rounded-full backdrop-blur-sm border border-gray-600/30 shadow-lg">
                  <img
                    src={char.element2.icon_url}
                    className="w-10 h-10 object-contain"
                    title={char.element2.name}
                    alt="element2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================== ข้อมูลฝั่งขวา ===================== */}
        <div className="flex-1">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 italic tracking-tighter uppercase">
            {char.name}
          </h1>

          <div className="flex items-center flex-wrap gap-4 mb-8 bg-red-950/20 p-4 rounded-2xl border border-red-900/30 w-fit">
            {char.hbr_classes && (
              <>
                <img
                  src={char.hbr_classes.icon_url}
                  alt={char.hbr_classes.name}
                  className="w-14 h-14 object-contain drop-shadow-lg"
                />
                <div>
                  <p className="text-3xl font-black text-red-500 leading-none">
                    {char.hbr_classes.name}
                  </p>
                  <p className="text-xs text-red-700 font-bold tracking-widest">
                    {char.hbr_classes.name_jp}
                  </p>
                </div>
                <span className="text-gray-600 mx-2">|</span>
              </>
            )}
            {char.rarity === "SS Resonance" && (
              <div className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white px-5 py-2 rounded-xl font-black text-lg shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-white/30 tracking-wider">
                SS Resonance
              </div>
            )}
            {char.rarity === "SS" && (
              <div className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white px-5 py-2 rounded-xl font-black text-lg shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-yellow-300/50 tracking-wider">
                SS
              </div>
            )}
            {char.rarity === "S" && (
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-5 py-2 rounded-xl font-black text-lg shadow-[0_0_15px_rgba(96,165,250,0.5)] border border-blue-300/50 tracking-wider">
                S
              </div>
            )}
            {char.rarity === "A" && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-2 rounded-xl font-black text-lg shadow-[0_0_15px_rgba(251,146,60,0.5)] border border-orange-300/50 tracking-wider">
                A
              </div>
            )}
          </div>

          <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700 mb-10 shadow-inner">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3 border-b border-red-900 pb-2">
              Background Style
            </h3>
            <p className="text-gray-300 leading-relaxed text-lg">
              {char.description}
            </p>
          </div>

          <div className="space-y-12">
            {/* 1. EX Skill */}
            {exSkills.length > 0 && (
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-6 flex items-center gap-3 border-b-4 border-orange-600 w-fit pb-2">
                  <Sparkles className="text-orange-500" /> EX Skill (สกิลไม้ตาย)
                </h2>
                <div>{exSkills.map((s) => renderSkillCard(s, true))}</div>
              </div>
            )}

            {/* 2. Normal Skills */}
            {normalSkills.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 border-b-4 border-red-600 w-fit pb-2">
                  <Swords className="text-red-500" /> Battle Skills (สกิลปกติ)
                </h2>
                <div>{normalSkills.map((s) => renderSkillCard(s, false))}</div>
              </div>
            )}

            {/* ===================== โซนที่เพิ่มเข้ามาใหม่ (Passive Skills) ===================== */}
            {passiveSkills.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-gray-300 mb-6 flex items-center gap-3 border-b-4 border-gray-600 w-fit pb-2">
                  <ShieldCheck className="text-gray-400" /> Passive Skills
                  (สกิลติดตัว)
                </h2>
                <div>{passiveSkills.map((s) => renderSkillCard(s, false))}</div>
              </div>
            )}
            {/* ======================================================================= */}

            {/* 4. Initial Abilities (初期アビリティ) */}
            {initialAbilities.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-pink-400 mb-6 flex items-center gap-3 border-b-4 border-pink-900 w-fit pb-2">
                  <ShieldCheck className="text-pink-500" />
                  Initial Abilities
                </h2>
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                  <table className="w-full text-left">
                    <thead className="bg-pink-950/30 text-pink-300 text-sm">
                      <tr>
                        <th className="p-4 border-r border-gray-700/50">
                          ความสามารถ
                        </th>
                        <th className="p-4">เอฟเฟค</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {initialAbilities.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-gray-800 transition-colors"
                        >
                          <td className="p-4 font-bold text-pink-300 border-r border-gray-700/50 align-top">
                            {s.name_en || s.name_th}
                          </td>
                          <td className="p-4 text-gray-300 leading-relaxed whitespace-pre-line">
                            {s.description_th || s.description_en}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Orb Abilities (宝珠アビリティ) */}
            {orbAbilities.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-cyan-400 mb-6 flex items-center gap-3 border-b-4 border-cyan-900 w-fit pb-2">
                  <Component className="text-cyan-500" /> Orb Abilities
                </h2>
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                  <table className="w-full text-left">
                    <thead className="bg-cyan-950/30 text-cyan-300 text-sm">
                      <tr>
                        <th className="p-4 border-r border-gray-700/50">
                          ความสามารถของออร์บ
                        </th>
                        <th className="p-4">ผลกระทบ/สถานะเพิ่มเติม</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {orbAbilities.map((s) => (
                        <tr
                          key={s.id}
                          className="hover:bg-gray-800 transition-colors"
                        >
                          <td className="p-4 font-bold text-cyan-300 border-r border-gray-700/50 align-top">
                            {s.name_en || s.name_th}
                          </td>
                          <td className="p-4 text-gray-300 leading-relaxed whitespace-pre-line">
                            {s.description_th || s.description_en}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. Limit Break (限界突破段階) */}
            {limitBreaks && limitBreaks.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-yellow-400 mb-6 flex items-center gap-3 border-b-4 border-yellow-900 w-fit pb-2">
                  <ArrowUpCircle className="text-yellow-500" /> Limit Break
                </h2>
                <div className="overflow-x-auto rounded-xl border border-gray-700 shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-pink-950/40 text-pink-400 border-b border-gray-700 text-sm">
                        <th className="p-4 font-bold text-center w-24">ปลด</th>
                        <th className="p-4 font-bold text-center w-24">
                          เลเวลสูงสุด
                        </th>
                        <th className="p-4 font-bold text-center w-40">
                          Stat Boost
                          <br />
                        </th>
                        <th className="p-4 font-bold">
                          ความสามารถที่เพิ่ม
                          <br />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-800/40">
                      {limitBreaks.map((lb) => (
                        <tr
                          key={lb.tier}
                          className="hover:bg-gray-800/60 transition-colors"
                        >
                          <td className="p-4 text-center font-black text-2xl text-white border-r border-gray-700/50">
                            {lb.tier}
                          </td>
                          <td className="p-4 text-center text-gray-300 font-mono border-r border-gray-700/50">
                            {lb.level_cap}
                          </td>
                          <td className="p-4 text-center text-gray-300 border-r border-gray-700/50">
                            {lb.stat_boost}
                          </td>
                          <td className="p-4">
                            {lb.ability_name ? (
                              <>
                                <div className="font-bold text-pink-300 mb-1">
                                  {lb.ability_name}
                                </div>
                                <div className="text-sm text-gray-400 leading-relaxed">
                                  {lb.ability_desc}
                                </div>
                              </>
                            ) : (
                              <div className="text-gray-600 text-center text-xl">
                                -
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
