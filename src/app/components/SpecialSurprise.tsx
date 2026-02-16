import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

interface SpecialSurpriseProps {
  onClose: () => void;
}

const fullText = `Happy Valentine 14-02 ❤️
Tada... Bất ngờ chưa cưng
Không biết em có thích món quà này không ? Nhưng đây là tấm lòng nhỏ của Anh
Valentine đầu tiên của chúng ta từ lúc chính thức yêu nhau.
Cảm ơn Em đã bước vào cuộc đời anh, làm mọi thứ trở nên dịu dàng hơn (Hơi xạo ke 😏). Mong chúng ta sẽ luôn nắm tay nhau dù mai sau thế nào
Thương Em nhiều 🥰
❤️ ~~ From Heo 🐷 with love ~~ ❤️
PS: Biết Em không thích sến mà, đọc nổi da gà cục cục chưa ? 🤣. Web anh làm còn nhiều tính năng lắm, từ từ khám phá nha 
Lời cuối nè: 🐷❤️🐵`;

export function SpecialSurprise({ onClose }: SpecialSurpriseProps) {
  const [stage, setStage] = useState<"heart" | "message">("heart");
  const [displayedText, setDisplayedText] = useState("");

  // Memoize decoration elements to prevent re-render jitter
  const decorationParticles = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      // Start from various heights to show them immediately
      initialTop: i < 15 ? Math.random() * 80 : 110,
      duration: 12 + Math.random() * 10,
      delay: i < 15 ? 0 : Math.random() * 15,
      type: i % 2 === 0 ? "🌻" : "❤️",
      offsetStart: Math.random() * 20 - 10,
      offsetEnd: Math.random() * 20 - 10,
    }));
  }, []);

  useEffect(() => {
    if (stage === "message") {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(fullText.slice(0, index));
        index++;
        if (index > fullText.length) {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-rose-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "heart" ? (
          <motion.div
            key="heart-stage"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-center cursor-pointer"
            onClick={() => setStage("message")}
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                filter: [
                  "drop-shadow(0 0 0px rgba(244,63,94,0))",
                  "drop-shadow(0 0 25px rgba(244,63,94,0.5))",
                  "drop-shadow(0 0 0px rgba(244,63,94,0))",
                ],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-2xl">
                <defs>
                  <linearGradient
                    id="heartGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#fb7185" }} />
                    <stop offset="100%" style={{ stopColor: "#e11d48" }} />
                  </linearGradient>
                </defs>
                <path
                  d="M50 88.9L13.1 52.1C5.2 44.1 5.2 31.2 13.1 23.3C21 15.4 33.9 15.4 41.8 23.3L50 31.5L58.2 23.3C66.1 15.4 79 15.4 86.9 23.3C94.8 31.2 94.8 44.1 86.9 52.1L50 88.9Z"
                  fill="url(#heartGradient)"
                />
              </svg>
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl"
                animate={{ opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Nhấn vào đây
              </motion.div>
            </motion.div>
            <p className="mt-8 text-rose-600 font-medium animate-bounce">
              Có một món quà bí mật cho em... 🎁
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="message-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-y-auto"
          >
            {/* Background elements - Memoized to prevent jitter when typing */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {decorationParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{
                    left: `${p.left}%`,
                    top: `${p.initialTop}%`,
                    rotate: 0,
                    opacity: 0,
                  }}
                  animate={{
                    top: "-20%",
                    rotate: [0, 180, 360],
                    left: [
                      `${p.left}%`,
                      `${p.left + p.offsetStart}%`,
                      `${p.left + p.offsetEnd}%`,
                    ],
                    opacity: [0, 0.8, 0.8, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: p.delay,
                  }}
                  className="absolute text-5xl select-none"
                >
                  {p.type}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative z-10 max-w-2xl w-full bg-white/95 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-rose-200"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <div className="prose prose-rose max-w-none">
                <p className="whitespace-pre-wrap text-lg md:text-xl text-rose-950 font-bold leading-relaxed tracking-wide">
                  {displayedText}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-6 bg-rose-600 ml-1 align-middle"
                  />
                </p>
              </div>

              <div className="mt-12 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
                >
                  <X size={20} />
                  Đóng và tiếp tục
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
