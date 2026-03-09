"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "icon" | "character" | "skill" | "limit_break"
  >("character");
  const router = useRouter();

  // --- Data Lists ---
  const [attackTypes, setAttackTypes] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [hbrClasses, setHbrClasses] = useState<any[]>([]);
  const [charList, setCharList] = useState<any[]>([]);

  // --- Form States: 1. Icon ---
  const [iconCategory, setIconCategory] = useState<
    "attack" | "element" | "class"
  >("class");
  const [typeName, setTypeName] = useState("");
  const [typeNameJp, setTypeNameJp] = useState("");
  const [typeFile, setTypeFile] = useState<File | null>(null);

  // --- Form States: 2. Character ---
  const [charName, setCharName] = useState("");
  const [charGame, setCharGame] = useState("HBR");
  const [charRolePtn, setCharRolePtn] = useState("");
  const [charRarity, setCharRarity] = useState("SS");
  const [charDesc, setCharDesc] = useState("");
  const [charFile, setCharFile] = useState<File | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedElement1Id, setSelectedElement1Id] = useState("");
  const [selectedElement2Id, setSelectedElement2Id] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // --- Form States: 3. Skill ---
  const [selectedCharId, setSelectedCharId] = useState("");
  const [skillNameEn, setSkillNameEn] = useState("");
  const [skillNameTh, setSkillNameTh] = useState("");
  const [skillType, setSkillType] = useState("Skill");
  const [skillIconUrl, setSkillIconUrl] = useState("");
  const [skillDescEn, setSkillDescEn] = useState("");
  const [skillDescTh, setSkillDescTh] = useState("");
  const [spCost, setSpCost] = useState("");
  const [energyCost, setEnergyCost] = useState("");
  const [cooldown, setCooldown] = useState("");
  const [skillElementId, setSkillElementId] = useState("");
  const [skillAttackTypeId, setSkillAttackTypeId] = useState("");

  // --- Form States: 4. Limit Break (HBR) ---
  const [lbTier, setLbTier] = useState("1");
  const [lbLevelCap, setLbLevelCap] = useState("Lv.130");
  const [lbStatBoost, setLbStatBoost] = useState("全ステータス+10%");
  const [lbAbilityName, setLbAbilityName] = useState("");
  const [lbAbilityDesc, setLbAbilityDesc] = useState("");

  // เปลี่ยน Default เมื่อสลับเกม
  useEffect(() => {
    setCharRolePtn("");
    setCharRarity(charGame === "HBR" ? "SS" : "S");
  }, [charGame]);

  useEffect(() => {
    const char = charList.find((c) => c.id === selectedCharId);
    if (char?.game === "HBR") setSkillType("Skill");
    else if (char?.game === "PTN") setSkillType("Active");
  }, [selectedCharId, charList]);

  // เช็กสิทธิ์แอดมิน
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email === "admin@wiki.com") {
        setIsAdmin(true);
        fetchData();
      } else {
        router.push("/");
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    const { data: types } = await supabase.from("attack_types").select("*");
    const { data: elems } = await supabase.from("elements").select("*");
    const { data: classes } = await supabase.from("hbr_classes").select("*");
    const { data: chars } = await supabase
      .from("characters")
      .select("id, name, game")
      .order("name");
    setAttackTypes(types || []);
    setElements(elems || []);
    setHbrClasses(classes || []);
    setCharList(chars || []);
  };

  const uploadFile = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("game-assets")
      .upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("game-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  // 1. Submit Icon
  const handleAddIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFile || !typeName)
      return alert("กรุณากรอกชื่อและเลือกไฟล์รูปโลโก้");
    setLoading(true);
    try {
      const folder =
        iconCategory === "attack"
          ? "types"
          : iconCategory === "element"
            ? "elements"
            : "classes";
      const url = await uploadFile(typeFile, folder);
      const table =
        iconCategory === "attack"
          ? "attack_types"
          : iconCategory === "element"
            ? "elements"
            : "hbr_classes";

      const dataToInsert: any = { name: typeName, icon_url: url, game: "HBR" };
      if (iconCategory === "class") dataToInsert["name_jp"] = typeNameJp;

      const { error } = await supabase.from(table).insert([dataToInsert]);
      if (error) throw error;

      alert("เพิ่มไอคอนสำเร็จ!");
      setTypeName("");
      setTypeNameJp("");
      setTypeFile(null);
      fetchData();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Character
  const handleAddChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charFile || !charName) return alert("กรุณากรอกชื่อและเลือกรูปตัวละคร");
    setLoading(true);
    try {
      const url = await uploadFile(charFile, "characters");
      const { error } = await supabase.from("characters").insert([
        {
          name: charName,
          game: charGame,
          role: charGame === "PTN" ? charRolePtn : null,
          rarity: charRarity,
          description: charDesc,
          image_url: url,
          attack_type_id:
            charGame === "HBR" && selectedTypeId ? selectedTypeId : null,
          element1_id:
            charGame === "HBR" && selectedElement1Id
              ? selectedElement1Id
              : null,
          element2_id:
            charGame === "HBR" && selectedElement2Id
              ? selectedElement2Id
              : null,
          hbr_class_id:
            charGame === "HBR" && selectedClassId ? selectedClassId : null,
        },
      ]);

      if (error) throw error;
      alert("เพิ่มตัวละครสำเร็จ!");
      setCharName("");
      setCharRolePtn("");
      setCharDesc("");
      setCharFile(null);
      setSelectedTypeId("");
      setSelectedElement1Id("");
      setSelectedElement2Id("");
      setSelectedClassId("");
      fetchData();
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedChar = charList.find((c) => c.id === selectedCharId);
    if (!selectedChar) return alert("กรุณาเลือกตัวละครเป้าหมาย");
    setLoading(true);
    try {
      const { error } = await supabase.from("skills").insert([
        {
          character_id: selectedCharId,
          name_en: skillNameEn,
          name_th: skillNameTh,
          type: skillType,
          icon_url: skillIconUrl,
          description_en: skillDescEn,
          description_th: skillDescTh,
          sp_cost:
            selectedChar.game === "HBR" ? parseInt(spCost) || null : null,
          energy_cost:
            selectedChar.game === "PTN" ? parseInt(energyCost) || null : null,
          cooldown: selectedChar.game === "PTN" ? cooldown : null,
          element_id:
            selectedChar.game === "HBR" && skillElementId
              ? skillElementId
              : null,
          attack_type_id:
            selectedChar.game === "HBR" && skillAttackTypeId
              ? skillAttackTypeId
              : null,
        },
      ]);

      if (error) throw error;
      alert("เพิ่มสกิล/อะบิลิตี้สำเร็จ!");
      setSkillNameEn("");
      setSkillNameTh("");
      setSkillIconUrl("");
      setSkillDescEn("");
      setSkillDescTh("");
      setSpCost("");
      setEnergyCost("");
      setCooldown("");
      setSkillElementId("");
      setSkillAttackTypeId("");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Limit Break
  const handleAddLimitBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharId) return alert("กรุณาเลือกตัวละครเป้าหมาย");
    setLoading(true);
    try {
      const { error } = await supabase.from("hbr_limit_breaks").insert([
        {
          character_id: selectedCharId,
          tier: parseInt(lbTier),
          level_cap: lbLevelCap,
          stat_boost: lbStatBoost,
          ability_name: lbAbilityName,
          ability_desc: lbAbilityDesc,
        },
      ]);
      if (error) throw error;
      alert(`เพิ่ม Limit Break ขั้น ${lbTier} สำเร็จ!`);
      setLbAbilityName("");
      setLbAbilityDesc("");
    } catch (err: any) {
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isAdmin)
    return (
      <div className="p-20 text-center text-white font-bold">กำลังโหลด...</div>
    );
  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldCheck className="text-green-500" size={32} /> Admin Control
          Center
        </h1>
        <Link href="/" className="text-gray-400 hover:text-white flex gap-2">
          <ArrowLeft size={18} /> กลับหน้าหลัก
        </Link>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("icon")}
          className={`px-4 py-3 rounded-xl font-bold shrink-0 ${activeTab === "icon" ? "bg-red-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          1. จัดการไอคอน
        </button>
        <button
          onClick={() => setActiveTab("character")}
          className={`px-4 py-3 rounded-xl font-bold shrink-0 ${activeTab === "character" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          2. เพิ่มตัวละคร
        </button>
        <button
          onClick={() => setActiveTab("skill")}
          className={`px-4 py-3 rounded-xl font-bold shrink-0 ${activeTab === "skill" ? "bg-purple-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          3. เพิ่มสกิล/อะบิลิตี้
        </button>
        <button
          onClick={() => setActiveTab("limit_break")}
          className={`px-4 py-3 rounded-xl font-bold shrink-0 ${activeTab === "limit_break" ? "bg-pink-600 text-white shadow-lg" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          4. ลิมิตเบรค (HBR)
        </button>
      </div>

      {/* ---------------- แท็บ 1: จัดการไอคอน ---------------- */}
      {activeTab === "icon" && (
        <form
          onSubmit={handleAddIcon}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-4 animate-in fade-in duration-300"
        >
          <h2 className="text-xl font-bold text-red-400">
            อัปโหลดโลโก้ (HBR Special)
          </h2>
          <select
            value={iconCategory}
            onChange={(e) => setIconCategory(e.target.value as any)}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold"
          >
            <option value="class">คลาส (Role) 9 อัน</option>
            <option value="attack">ประเภทดาเมจ (斩, 打, 突)</option>
            <option value="element">
              ธาตุ (ไฟ, น้ำแข็ง, สายฟ้า, แสง, มืด)
            </option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="ชื่อไอคอน (EN) เช่น Attacker"
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
              required
            />
            {iconCategory === "class" && (
              <input
                value={typeNameJp}
                onChange={(e) => setTypeNameJp(e.target.value)}
                placeholder="ชื่อภาษาญี่ปุ่น (เช่น アタッカー)"
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
              />
            )}
          </div>
          <input
            type="file"
            onChange={(e) => setTypeFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 py-3 rounded-lg font-black ${loading ? "opacity-50" : "hover:bg-red-500"}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกโลโก้เข้าคลัง"}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">
                คลาส 9 อัน
              </h3>
              <div className="flex flex-wrap gap-2">
                {hbrClasses.map((t) => (
                  <img
                    key={t.id}
                    src={t.icon_url}
                    className="w-9 h-9 object-contain bg-gray-800 rounded p-1"
                    title={`${t.name} (${t.name_jp})`}
                    alt={t.name}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">
                ประเภทโจมตี
              </h3>
              <div className="flex flex-wrap gap-2">
                {attackTypes.map((t) => (
                  <img
                    key={t.id}
                    src={t.icon_url}
                    className="w-9 h-9 object-contain bg-gray-800 rounded p-1"
                    title={t.name}
                    alt={t.name}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-3 border-b border-gray-800 pb-2">
                ธาตุ
              </h3>
              <div className="flex flex-wrap gap-2">
                {elements.map((t) => (
                  <img
                    key={t.id}
                    src={t.icon_url}
                    className="w-9 h-9 object-contain bg-gray-800 rounded p-1"
                    title={t.name}
                    alt={t.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ---------------- แท็บ 2: จัดการตัวละคร ---------------- */}
      {activeTab === "character" && (
        <form
          onSubmit={handleAddChar}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-4 animate-in fade-in duration-300"
        >
          <h2 className="text-xl font-bold text-blue-400">เพิ่มตัวละครใหม่</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="ชื่อตัวละคร"
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
              required
            />
            <select
              value={charGame}
              onChange={(e) => setCharGame(e.target.value)}
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold"
            >
              <option value="HBR">Heaven Burns Red</option>
              <option value="PTN">Path to Nowhere</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {charGame === "HBR" ? (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold"
                required
              >
                <option value="">-- เลือกคลาส (Role Icon) --</option>
                {hbrClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.name_jp})
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={charRolePtn}
                onChange={(e) => setCharRolePtn(e.target.value)}
                placeholder="อาชีพ (PTN เช่น Fury / Reticle)"
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
              />
            )}

            {charGame === "HBR" ? (
              <select
                value={charRarity}
                onChange={(e) => setCharRarity(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold text-red-400"
              >
                <option value="SS Resonance">SS Resonance</option>
                <option value="SS">SS</option>
                <option value="S">S</option>
                <option value="A">A</option>
              </select>
            ) : (
              <select
                value={charRarity}
                onChange={(e) => setCharRarity(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold text-purple-400"
              >
                <option value="S">Rank S</option>
                <option value="A">Rank A</option>
                <option value="B">Rank B</option>
              </select>
            )}
          </div>

          {charGame === "HBR" && (
            <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/30 space-y-3">
              <label className="text-xs text-red-400 font-bold block">
                ข้อมูลการโจมตีและธาตุ (HBR Special)
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full bg-gray-900 border border-red-900/50 p-2.5 rounded text-white text-sm"
              >
                <option value="">-- ไม่ระบุประเภทโจมตี --</option>
                {attackTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedElement1Id}
                  onChange={(e) => setSelectedElement1Id(e.target.value)}
                  className="w-full bg-gray-900 border border-orange-900/50 p-2.5 rounded text-white text-sm"
                >
                  <option value="">-- ธาตุที่ 1 --</option>
                  {elements.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedElement2Id}
                  onChange={(e) => setSelectedElement2Id(e.target.value)}
                  className="w-full bg-gray-900 border border-orange-900/50 p-2.5 rounded text-white text-sm"
                >
                  <option value="">-- ธาตุที่ 2 (ถ้ามี) --</option>
                  {elements.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <textarea
            value={charDesc}
            onChange={(e) => setCharDesc(e.target.value)}
            placeholder="ประวัติย่อ / รายละเอียด"
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
          />
          <input
            type="file"
            onChange={(e) => setCharFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 py-3 rounded-lg font-black ${loading ? "opacity-50" : "hover:bg-blue-500"}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกตัวละคร"}
          </button>
        </form>
      )}

      {/* ---------------- แท็บ 3: จัดการสกิลและอะบิลิตี้ ---------------- */}
      {activeTab === "skill" && (
        <form
          onSubmit={handleAddSkill}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-4 animate-in fade-in duration-300"
        >
          <h2 className="text-xl font-bold text-purple-400">
            เพิ่มสกิล หรือ อะบิลิตี้ติดตัว
          </h2>
          <select
            value={selectedCharId}
            onChange={(e) => setSelectedCharId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold"
            required
          >
            <option value="">-- เลือกตัวละครเป้าหมาย --</option>
            {charList.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.game}] {c.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              value={skillNameEn}
              onChange={(e) => setSkillNameEn(e.target.value)}
              placeholder="ชื่อสกิล (EN/JP) เช่น [Auto] 追撃"
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
              required
            />
            <input
              value={skillNameTh}
              onChange={(e) => setSkillNameTh(e.target.value)}
              placeholder="ชื่อสกิล (TH)"
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {charList.find((c) => c.id === selectedCharId)?.game === "HBR" ? (
              <select
                value={skillType}
                onChange={(e) => setSkillType(e.target.value)}
                className="bg-gray-900 border border-red-900/50 p-3 rounded text-white font-bold text-red-300"
              >
                <option value="EX Skill">EX Skill (สกิลไม้ตาย)</option>
                <option value="Skill">Skill (สกิลปกติ)</option>
                <option value="Passive">Passive (สกิลติดตัว)</option>
                <option value="Initial Ability">
                  Initial Ability (อะบิลิตี้เริ่มต้น)
                </option>
                <option value="Orb Ability">
                  Orb Ability (อะบิลิตี้ลูกแก้ว)
                </option>
              </select>
            ) : (
              <select
                value={skillType}
                onChange={(e) => setSkillType(e.target.value)}
                className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
              >
                <option value="Active">Active</option>
                <option value="Passive">Passive</option>
                <option value="Ultimate">Ultimate</option>
              </select>
            )}

            {charList.find((c) => c.id === selectedCharId)?.game === "HBR" &&
            (skillType === "EX Skill" || skillType === "Skill") ? (
              <input
                type="number"
                value={spCost}
                onChange={(e) => setSpCost(e.target.value)}
                placeholder="SP Cost (เฉพาะสกิล)"
                className="bg-gray-900 border border-red-500/50 p-3 rounded text-white"
              />
            ) : charList.find((c) => c.id === selectedCharId)?.game ===
              "PTN" ? (
              <>
                <input
                  type="number"
                  value={energyCost}
                  onChange={(e) => setEnergyCost(e.target.value)}
                  placeholder="Energy"
                  className="bg-gray-900 border border-purple-500/50 p-3 rounded text-white"
                />
                <input
                  value={cooldown}
                  onChange={(e) => setCooldown(e.target.value)}
                  placeholder="CD"
                  className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
                />
              </>
            ) : null}
          </div>

          {charList.find((c) => c.id === selectedCharId)?.game === "HBR" &&
            (skillType === "EX Skill" || skillType === "Skill") && (
              <div className="grid grid-cols-2 gap-4 bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                <div>
                  <label className="text-xs text-red-400 font-bold mb-1 block">
                    ธาตุของสกิล (ถ้ามี)
                  </label>
                  <select
                    value={skillElementId}
                    onChange={(e) => setSkillElementId(e.target.value)}
                    className="w-full bg-gray-900 border border-orange-900/50 p-2.5 rounded text-white text-sm"
                  >
                    <option value="">-- ไม่ระบุธาตุ --</option>
                    {elements.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-red-400 font-bold mb-1 block">
                    ประเภทการโจมตี (ถ้ามี)
                  </label>
                  <select
                    value={skillAttackTypeId}
                    onChange={(e) => setSkillAttackTypeId(e.target.value)}
                    className="w-full bg-gray-900 border border-red-900/50 p-2.5 rounded text-white text-sm"
                  >
                    <option value="">-- ไม่ระบุ --</option>
                    {attackTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          <textarea
            value={skillDescTh}
            onChange={(e) => setSkillDescTh(e.target.value)}
            placeholder="【ผลของสกิล / อะบิลิตี้】 (แปลภาษาไทย พิมพ์ลงมาได้เลย)"
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
            rows={3}
          />
          <textarea
            value={skillDescEn}
            onChange={(e) => setSkillDescEn(e.target.value)}
            placeholder="【ข้อมูลเชิงลึก / สเตตัสเพิ่มเติม】"
            rows={2}
            className="w-full bg-gray-900/50 border border-gray-700 p-3 rounded text-gray-400 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 py-3 rounded font-bold ${loading ? "opacity-50" : "hover:bg-purple-500"}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </form>
      )}

      {/* ---------------- แท็บ 4: Limit Break (HBR เท่านั้น) ---------------- */}
      {activeTab === "limit_break" && (
        <form
          onSubmit={handleAddLimitBreak}
          className="bg-gray-800 p-8 rounded-2xl border border-pink-900/50 space-y-4 animate-in fade-in duration-300"
        >
          <h2 className="text-xl font-bold text-pink-400">
            ข้อมูล Limit Break (限界突破段階)
          </h2>
          <select
            value={selectedCharId}
            onChange={(e) => setSelectedCharId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white font-bold"
            required
          >
            <option value="">-- เลือกตัวละคร (แสดงเฉพาะ HBR) --</option>
            {charList
              .filter((c) => c.game === "HBR")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-pink-400 font-bold block mb-1">
                ขั้นที่ (Tier)
              </label>
              <select
                value={lbTier}
                onChange={(e) => setLbTier(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
              >
                <option value="1">ขั้นที่ 1</option>
                <option value="2">ขั้นที่ 2</option>
                <option value="3">ขั้นที่ 3</option>
                <option value="4">ขั้นที่ 4</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-pink-400 font-bold block mb-1">
                Max Lv.
              </label>
              <input
                value={lbLevelCap}
                onChange={(e) => setLbLevelCap(e.target.value)}
                placeholder="เช่น Lv.130"
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-pink-400 font-bold block mb-1">
                Stat Boost
              </label>
              <input
                value={lbStatBoost}
                onChange={(e) => setLbStatBoost(e.target.value)}
                placeholder="เช่น 全ステータス+10%"
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
                required
              />
            </div>
          </div>

          <div className="bg-pink-950/20 p-4 rounded-xl border border-pink-900/30">
            <label className="text-xs text-pink-400 font-bold block mb-3 border-b border-pink-900/50 pb-2">
              อะบิลิตี้ที่ได้รับเมื่อปลดขั้น (ถ้ามี)
            </label>
            <input
              value={lbAbilityName}
              onChange={(e) => setLbAbilityName(e.target.value)}
              placeholder="ชื่อสกิล (เช่น 【Auto】閃光)"
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white mb-3"
            />
            <textarea
              value={lbAbilityDesc}
              onChange={(e) => setLbAbilityDesc(e.target.value)}
              placeholder="ผลของสกิล (เช่น ターン開始時に...)"
              rows={2}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-pink-600 py-3 rounded font-bold ${loading ? "opacity-50" : "hover:bg-pink-500"}`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล Limit Break"}
          </button>
        </form>
      )}
    </div>
  );
}
