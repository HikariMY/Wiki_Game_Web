"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Send,
  User,
  Trash2,
  Edit3,
  X,
  Check,
} from "lucide-react";

export default function ThreadDetail() {
  const params = useParams();
  const router = useRouter();
  const gameCode = (params.game as string).toUpperCase();
  const postId = params.id as string;

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State สำหรับการแก้ไข
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const isHBR = gameCode === "HBR";

  const fetchPostAndComments = useCallback(async () => {
    setLoading(true);
    const { data: postData } = await supabase
      .from("posts")
      .select("*, profiles(display_name, avatar_url)")
      .eq("id", postId)
      .single();
    if (postData) {
      setPost(postData);
      setEditTitle(postData.title);
      setEditContent(postData.content);
    }
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*, profiles(display_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments(commentsData || []);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  // ---จัดการกระทู้---
  const handleUpdatePost = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ title: editTitle, content: editContent })
      .eq("id", postId);
    if (error) alert(error.message);
    else {
      setEditingPost(false);
      fetchPostAndComments();
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("ยืนยันการลบกระทู้นี้? ข้อมูลทั้งหมดรวมถึงคอมเมนต์จะหายไป"))
      return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) alert(error.message);
    else router.push(`/forum/${gameCode.toLowerCase()}`);
  };

  // ---จัดการคอมเมนต์---
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("comments")
      .insert([
        {
          post_id: postId,
          user_id: user.id,
          author_email: user.email,
          content: newComment,
        },
      ]);
    if (error) alert(error.message);
    else {
      setNewComment("");
      fetchPostAndComments();
    }
    setSubmitting(false);
  };

  const handleUpdateComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ content: editCommentContent })
      .eq("id", commentId);
    if (error) alert(error.message);
    else {
      setEditingCommentId(null);
      fetchPostAndComments();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("ลบคอมเมนต์นี้?")) return;
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) alert(error.message);
    else fetchPostAndComments();
  };

  if (loading)
    return (
      <div className="text-center py-32 text-gray-400 text-xl font-bold animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );
  if (!post)
    return (
      <div className="text-center py-32 text-white text-2xl font-bold">
        ไม่พบกระทู้นี้ ❌
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link
        href={`/forum/${gameCode.toLowerCase()}`}
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" /> กลับไปหน้าฟอรัม {gameCode}
      </Link>

      {/* 📝 กล่องกระทู้หลัก */}
      <div
        className={`bg-gray-800 p-8 rounded-2xl shadow-xl border mb-8 ${isHBR ? "border-red-900/50" : "border-purple-900/50"}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full bg-gray-900 border ${isHBR ? "border-red-900/50 text-red-400" : "border-purple-900/50 text-purple-400"}`}
            >
              {post.category || "ทั่วไป"}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              {new Date(post.created_at).toLocaleDateString("th-TH")}
            </span>
          </div>

          {/* ปุ่มจัดการกระทู้ (โชว์เฉพาะเจ้าของ) */}
          {user?.id === post.user_id && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingPost(!editingPost)}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={handleDeletePost}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>

        {editingPost ? (
          <div className="space-y-4">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white font-bold text-2xl"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingPost(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg font-bold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpdatePost}
                className="px-4 py-2 bg-blue-600 rounded-lg font-bold flex gap-2 items-center"
              >
                <Check size={18} /> บันทึก
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-black text-white mb-6 leading-snug">
              {post.title}
            </h1>
            {post.image_url && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-700">
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full max-h-[500px] object-contain bg-gray-900"
                />
              </div>
            )}
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-lg mb-8">
              {post.content}
            </p>
          </>
        )}

        <div className="pt-4 border-t border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 flex items-center justify-center">
            {post.profiles?.avatar_url ? (
              <img
                src={post.profiles.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>
          <p className="font-bold text-blue-400 text-sm">
            {post.profiles?.display_name || post.author_email}
          </p>
        </div>
      </div>

      {/* 💬 คอมเมนต์ */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-700 pb-2">
          <MessageCircle
            size={24}
            className={isHBR ? "text-red-400" : "text-purple-400"}
          />{" "}
          คอมเมนต์ ({comments.length})
        </h3>

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div
              key={comment.id}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden shrink-0 border-2 border-gray-600 flex items-center justify-center">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-gray-400">{index + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-bold text-blue-400 text-sm">
                      {comment.profiles?.display_name || comment.author_email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  {/* ปุ่มจัดการคอมเมนต์ */}
                  {user?.id === comment.user_id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditCommentContent(comment.content);
                        }}
                        className="text-gray-500 hover:text-blue-400"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-xs font-bold text-gray-400 hover:text-white"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        บันทึก
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✍️ ฟอร์มเขียนคอมเมนต์ */}
      {user ? (
        <form
          onSubmit={handleCommentSubmit}
          className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none mb-4"
            placeholder="พิมพ์คอมเมนต์ที่นี่..."
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors text-white shadow-lg ${isHBR ? "bg-red-600 hover:bg-red-500" : "bg-purple-600 hover:bg-purple-500"} ${submitting ? "opacity-50" : ""}`}
            >
              <Send size={18} />
              {submitting ? "กำลังส่ง..." : "ส่งคอมเมนต์"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center">
          <p className="text-gray-400 mb-4">เข้าสู่ระบบเพื่อคอมเมนต์</p>
          <Link
            href="/login"
            className="bg-blue-600 px-6 py-2 rounded-lg font-bold"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      )}
    </div>
  );
}
