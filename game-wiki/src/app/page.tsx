import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl md:text-5xl font-black mb-4">
        ยินดีต้อนรับสู่{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Wiki Database
        </span>
      </h1>
      <p className="text-xl text-gray-400 mb-12">
        โปรดเลือกเกมที่คุณต้องการดูข้อมูล
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* === [ บล็อกที่ 1: ทางเข้า HBR ] === */}
        {/* เปลี่ยน h-64 เป็นความสูงที่พอดี และใส่ overflow-hidden ไม่ให้รูปล้นขอบ */}
        <Link
          href="/hbr"
          className="group relative block overflow-hidden rounded-2xl border-2 border-red-900/50 hover:border-red-500 transition-all duration-300 h-72"
        >
          {/* 🖼️ ดึงรูปภาพมาใส่ (ถ้าไฟล์คุณเป็น .png ให้แก้ตรง src ด้วยนะครับ) */}
          <img
            src="/hbr_selec_bg.jpg"
            alt="Heaven Burns Red"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />

          {/* เลเยอร์ไล่สีดำจากข้างล่างขึ้นมา เพื่อให้ตัวหนังสือสีขาวอ่านง่าย */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>

          <div className="absolute bottom-0 left-0 p-6 z-20 w-full text-left">
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors drop-shadow-lg">
              Heaven Burns Red
            </h2>
            <p className="text-red-100 text-sm drop-shadow-md">
              ข้อมูลตัวละคร, สไตล์, สกิล และเนื้อเรื่อง
            </p>
          </div>
        </Link>

        {/* === [ บล็อกที่ 2: ทางเข้า PTN ] === */}
        <Link
          href="/ptn"
          className="group relative block overflow-hidden rounded-2xl border-2 border-purple-900/50 hover:border-purple-500 transition-all duration-300 h-72"
        >
          {/* 🖼️ ดึงรูปภาพมาใส่ */}
          <img
            src="/ptn_selec_bg.jpg"
            alt="Path to Nowhere"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          />

          {/* เลเยอร์ไล่สีดำ */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-10"></div>

          <div className="absolute bottom-0 left-0 p-6 z-20 w-full text-left">
            <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors drop-shadow-lg">
              Path to Nowhere
            </h2>
            <p className="text-purple-100 text-sm drop-shadow-md">
              ข้อมูลคนบาป, อาชญากรรม, สกิล และแบนเนอร์
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
