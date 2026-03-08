import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0;

export default async function PTNWiki() {
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("game", "PTN");

  return (
    <div>
      <div className="mb-8 border-b border-purple-900 pb-4">
        <h1 className="text-3xl font-black text-purple-400 drop-shadow-md">
          Path to Nowhere (PTN)
        </h1>
        <p className="text-gray-400 mt-2">
          ฐานข้อมูลคนบาป (Sinner) และการจัดทีม
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {characters?.map((char) => (
          <Link
            href={`/ptn/${char.id}`}
            key={char.id}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-purple-900/30 hover:border-purple-500 hover:-translate-y-1 transition duration-300 block"
          >
            <img
              src={char.image_url}
              alt={char.name}
              className="w-full h-64 object-cover object-top"
            />
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold">{char.name}</h2>
                <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded">
                  {char.rarity}
                </span>
              </div>
              <p className="text-purple-400 text-sm mb-3">อาชีพ: {char.role}</p>
              <p className="text-gray-400 text-sm line-clamp-2">
                {char.description}
              </p>
            </div>
          </Link>
        ))}
        {characters?.length === 0 && (
          <p className="text-gray-500">ยังไม่มีข้อมูลตัวละคร PTN ในระบบ</p>
        )}
      </div>
    </div>
  );
}
