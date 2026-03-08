"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserPlus,
  Zap,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Swords,
} from "lucide-react";
import Link from "next/link";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"type" | "character" | "skill">(
    "type",
  );
  const router = useRouter();

  // --- Data States ---
  const [charList, setCharList] = useState<any[]>([]);
  const [attackTypes, setAttackTypes] = useState<any[]>([]);

  // --- Form States ---
  const [name, setName] = useState("");
  const [game, setGame] = useState("HBR");
  const [file, setFile] = useState<File | null>(null);
  const [selectedCharId, setSelectedCharId] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email === "admin@wiki.com") {
        // ยืนยันสิทธิ์แอดมิน
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
    const { data: chars } = await supabase
      .from("characters")
      .select("id, name, game");
    const { data: types } = await supabase.from("attack_types").select("*");
    setCharList(chars || []);
    setAttackTypes(types || []);
  };

  const uploadFile = async (file: File, folder: string) => {
    const path = `${folder}/${Date.now()}_${file.name}`;
    await supabase.storage.from("game-assets").upload(path, file);
    const { data } = supabase.storage.from("game-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  // 1. เพิ่มประเภทการโจมตี (斩/打/突)
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const url = await uploadFile(file, "types");
    await supabase
      .from("attack_types")
      .insert([{ name, icon_url: url, game: "HBR" }]);
    alert("เพิ่มประเภทการโจมตีสำเร็จ!");
    setName("");
    setFile(null);
    fetchData();
  };

  // 2. เพิ่มตัวละคร
  const handleAddChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const url = await uploadFile(file, "characters");
    await supabase.from("characters").insert([
      {
        name,
        game,
        image_url: url,
        attack_type_id: game === "HBR" ? selectedTypeId : null,
      },
    ]);
    alert("เพิ่มตัวละครสำเร็จ!");
    setName("");
    setFile(null);
    fetchData();
  };

  if (loading)
    return <div className="p-20 text-center text-white">กำลังโหลด...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <ShieldCheck className="text-green-500" /> Admin Dashboard
        </h1>
        <Link href="/" className="text-gray-400 hover:text-white flex gap-2">
          <ArrowLeft /> กลับหน้าหลัก
        </Link>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("type")}
          className={`px-6 py-3 rounded-xl font-bold shrink-0 ${activeTab === "type" ? "bg-red-600" : "bg-gray-800"}`}
        >
          1. เพิ่มโลโก้โจมตี (HBR)
        </button>
        <button
          onClick={() => setActiveTab("character")}
          className={`px-6 py-3 rounded-xl font-bold shrink-0 ${activeTab === "character" ? "bg-blue-600" : "bg-gray-800"}`}
        >
          2. เพิ่มตัวละคร
        </button>
        <button
          onClick={() => setActiveTab("skill")}
          className={`px-6 py-3 rounded-xl font-bold shrink-0 ${activeTab === "skill" ? "bg-purple-600" : "bg-gray-800"}`}
        >
          3. เพิ่มสกิล
        </button>
      </div>

      {activeTab === "type" && (
        <form
          onSubmit={handleAddType}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-4"
        >
          <h2 className="text-xl font-bold text-red-400">
            อัปโหลดโลโก้ประเภทการโจมตี (斬/打/突)
          </h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อประเภท (เช่น Slash)"
            className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white"
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-red-600 py-3 rounded-lg font-black hover:bg-red-500 transition-colors"
          >
            บันทึกลงคลังไอคอน
          </button>
        </form>
      )}

      {activeTab === "character" && (
        <form
          onSubmit={handleAddChar}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-4"
        >
          <h2 className="text-xl font-bold text-blue-400">เพิ่มตัวละครใหม่</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อตัวละคร"
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
              required
            />
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="bg-gray-900 border border-gray-700 p-3 rounded text-white"
            >
              <option value="HBR">Heaven Burns Red</option>
              <option value="PTN">Path to Nowhere</option>
            </select>
          </div>
          {game === "HBR" && (
            <select
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="w-full bg-gray-900 border border-red-900/50 p-3 rounded text-white"
            >
              <option value="">-- เลือกประเภทการโจมตีที่อัปโหลดไว้ --</option>
              {attackTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded-lg font-black hover:bg-blue-500 transition-colors"
          >
            บันทึกตัวละคร
          </button>
        </form>
      )}
    </div>
  );
}
