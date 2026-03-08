"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // จัดการล็อกอินด้วย Email
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("สมัครสมาชิกสำเร็จ!");
        // พอดียกเลิก Confirm Email ไปแล้ว สมัครปุ๊บให้ล็อกอินเลย
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  // จัดการล็อกอินด้วย 3rd Party (Google / Discord)
  const handleSocialLogin = async (provider: "google" | "discord") => {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-2 text-white">
          {isSignUp ? "สร้างบัญชีใหม่" : "เข้าสู่ระบบ"}
        </h1>
        <p className="text-center text-gray-400 mb-8">
          เพื่อเข้าร่วมพูดคุยในเว็บบอร์ดคอมมูนิตี้
        </p>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition-colors mt-4"
          >
            {loading
              ? "กำลังดำเนินการ..."
              : isSignUp
                ? "สมัครสมาชิก"
                : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <hr className="w-full border-gray-600" />
          <span className="px-3 text-gray-400 text-sm">หรือ</span>
          <hr className="w-full border-gray-600" />
        </div>

        {/* ปุ่ม Social Login */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            เข้าสู่ระบบด้วย Google
          </button>

          <button
            onClick={() => handleSocialLogin("discord")}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2.5 rounded-lg transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/353655/discord-icon.svg"
              alt="Discord"
              className="w-5 h-5"
            />
            เข้าสู่ระบบด้วย Discord
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isSignUp ? "มีบัญชีอยู่แล้ว? " : "ยังไม่มีบัญชี? "}
          <button
            type="button" // แก้ตรงนี้เล็กน้อยเพื่อไม่ให้ Form เด้ง
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 font-bold underline ml-1"
          >
            {isSignUp ? "เข้าสู่ระบบเลย" : "สมัครสมาชิกฟรี"}
          </button>
        </div>
      </div>
    </div>
  );
}
