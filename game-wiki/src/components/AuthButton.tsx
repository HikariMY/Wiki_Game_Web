"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LogIn, LogOut, Settings, User } from "lucide-react";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // โหลด User ตอนเปิดเว็บ
    const fetchUserAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // ดึงโปรไฟล์มาโชว์ที่เมนู
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(data);
      }
    };

    fetchUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserAndProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {/* กล่องแสดงโปรไฟล์ กดแล้วไปหน้าตั้งค่า */}
        <Link
          href="/profile"
          className="hidden md:flex items-center gap-2 text-sm text-gray-200 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full border border-gray-600 transition-colors"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover border border-gray-500"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center border border-blue-500">
              <User size={14} className="text-blue-300" />
            </div>
          )}
          <span className="font-bold max-w-[120px] truncate">
            {profile?.display_name || user.email.split("@")[0]}
          </span>
          <Settings size={14} className="text-gray-400 ml-1" />
        </Link>

        <button
          onClick={handleLogout}
          className="hover:bg-red-900/50 text-red-400 px-3 py-2 rounded-md font-medium flex gap-2 transition-colors border border-transparent hover:border-red-500/50"
        >
          <LogOut size={18} /> ออกจากระบบ
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex gap-2 transition-colors shadow-lg shadow-blue-500/20"
    >
      <LogIn size={18} /> เข้าสู่ระบบ
    </Link>
  );
}
