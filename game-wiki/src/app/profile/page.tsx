"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Image as ImageIcon, Save } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // โหลดข้อมูล User และ Profile
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // ดึงข้อมูลโปรไฟล์จากตาราง profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setDisplayName(profileData.display_name || "");
        setAvatarUrl(profileData.avatar_url || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  // ฟังก์ชันบันทึกโปรไฟล์
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let newAvatarUrl = avatarUrl;

      // ถ้ามีการเลือกรูปใหม่ ให้อัปโหลดขึ้นถัง avatars
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        newAvatarUrl = publicUrlData.publicUrl;
      }

      // บันทึก/อัปเดต ลงตาราง profiles
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName,
        avatar_url: newAvatarUrl,
      });

      if (error) throw error;

      alert("อัปเดตโปรไฟล์สำเร็จ! 🎉");
      window.location.reload(); // รีเฟรชหน้าเพื่ออัปเดตข้อมูลบนเมนู
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-32 text-gray-400">กำลังโหลดข้อมูล...</div>
    );

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> กลับไปหน้าหลัก
      </Link>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <User className="text-blue-500" size={32} /> ตั้งค่าโปรไฟล์
        </h1>
        <p className="text-gray-400 mb-8 border-b border-gray-700 pb-4">
          ตั้งชื่อและรูปภาพให้เพื่อนๆ ในฟอรัมจำคุณได้
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ส่วนแสดงรูปโปรไฟล์ */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-900 p-6 rounded-xl border border-gray-700">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-600 shrink-0">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon size={16} className="text-blue-400" />{" "}
                อัปโหลดรูปโปรไฟล์ใหม่
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-gray-400 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900/50 file:text-blue-300 hover:file:bg-blue-900 transition-colors"
              />
            </div>
          </div>

          {/* ส่วนเปลี่ยนชื่อ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ชื่อที่แสดง (Display Name)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              placeholder="ตั้งชื่อเล่นของคุณ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              อีเมล (บัญชีที่ใช้ล็อกอิน)
            </label>
            <input
              type="text"
              value={user?.email}
              disabled
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg transition-colors text-lg shadow-lg flex justify-center items-center gap-2 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Save size={20} />
            {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
          </button>
        </form>
      </div>
    </div>
  );
}
