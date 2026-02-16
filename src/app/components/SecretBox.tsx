import React, { useState } from "react";
import { Lock, Unlock, Mail, Gift, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SecretNote {
  id: number;
  content: string;
  sender: string;
  isOpened: boolean;
}

const INITIAL_NOTES: SecretNote[] = [
  {
    id: 1,
    content:
      "Lần đầu tiên mình gặp nhau, anh đã biết em là định mệnh của đời anh.",
    sender: "Heo",
    isOpened: false,
  },
  {
    id: 2,
    content: "Em là điều tuyệt vời nhất từng đến với anh. Yêu em rất nhiều!",
    sender: "Heo",
    isOpened: false,
  },
  {
    id: 3,
    content: "Mỗi ngày trôi qua, anh lại thấy yêu em nhiều hơn một chút.",
    sender: "Heo",
    isOpened: false,
  },
  {
    id: 4,
    content: "Cảm ơn em đã luôn ở bên cạnh, động viên và chia sẻ cùng anh.",
    sender: "Heo",
    isOpened: false,
  },
];

export function SecretBox({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<SecretNote[]>(INITIAL_NOTES);
  const [selectedNote, setSelectedNote] = useState<SecretNote | null>(null);

  const openNote = (id: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isOpened: true } : n)),
    );
    const note = notes.find((n) => n.id === id);
    if (note) setSelectedNote({ ...note, isOpened: true });
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-rose-500 font-semibold hover:text-rose-600 transition-colors"
      >
        <span className="text-2xl">←</span> Quay lại
      </button>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Gift size={48} className="text-rose-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-dancing">
            Hộp bí mật
          </h1>
          <p className="text-gray-600 italic">
            Mở những hộp quà bí mật chứa đầy lời yêu thương...
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                note.isOpened
                  ? "bg-white border-2 border-rose-200"
                  : "bg-gradient-to-br from-rose-400 to-rose-600 text-white"
              }`}
              onClick={() => openNote(note.id)}
            >
              {note.isOpened ? (
                <>
                  <Mail size={32} className="text-rose-500" />
                  <span className="text-xs font-bold text-rose-400 uppercase">
                    Đã mở
                  </span>
                </>
              ) : (
                <>
                  <Lock size={32} />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Bí mật
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedNote(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-2xl relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 text-rose-100 rotate-12">
                  <Heart size={150} fill="currentColor" />
                </div>
                <div className="absolute -bottom-10 -left-10 text-rose-100 -rotate-12">
                  <Sparkles size={120} />
                </div>

                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-6">
                    <Unlock size={40} className="text-rose-500" />
                  </div>

                  <div className="font-dancing text-2xl text-gray-800 leading-relaxed mb-8">
                    "{selectedNote.content}"
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <Heart size={20} className="text-rose-500 fill-rose-500" />
                    <span className="text-sm font-bold text-gray-500 italic">
                      Từ: {selectedNote.sender}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedNote(null)}
                    className="mt-10 px-8 py-2 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600 transition-colors shadow-md"
                  >
                    Đóng lại
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
