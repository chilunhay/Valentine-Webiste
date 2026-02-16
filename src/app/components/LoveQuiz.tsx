import React, { useState, useEffect } from "react";
import { fetchQuizzes, type QuizItem } from "../api/quiz";
import {
  HelpCircle,
  Send,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoveQuiz() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchQuizzes();
        setQuizzes(data);
      } catch (e) {
        console.error("Failed to load quiz", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (quizzes.length > 0 && currentIndex < quizzes.length) {
      const current = quizzes[currentIndex];
      const allOptions = [current.answer, ...(current.options || [])];
      // Xáo trộn đáp án
      setShuffledOptions(allOptions.sort(() => Math.random() - 0.5));
      setShowHint(false);
      setFeedback(null);
    }
  }, [currentIndex, quizzes]);

  const handleSelectOption = (option: string) => {
    if (feedback) return;

    const currentQuiz = quizzes[currentIndex];
    const isCorrect =
      option.trim().toLowerCase() === currentQuiz.answer.trim().toLowerCase();

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: isCorrect,
    }));

    setFeedback({
      isCorrect,
      message: isCorrect
        ? currentQuiz.correctResponse
        : currentQuiz.incorrectResponse,
    });
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setFeedback(null);
    setIsFinished(false);
    setShowHint(false);
  };

  if (isLoading) return null;
  if (quizzes.length === 0) return null;

  const correctCount = Object.values(userAnswers).filter(Boolean).length;
  const percentage = Math.round((correctCount / quizzes.length) * 100);
  const isPass = percentage >= 80;

  return (
    <div className="max-w-2xl mx-auto my-6 sm:my-12 p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-rose-100">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-rose-100 rounded-xl sm:rounded-2xl text-rose-500">
            <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-rose-700 leading-tight">
              Trắc nghiệm tình yêu
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">
              Xem hai đứa hiểu nhau đến đâu ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      {!isFinished && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {quizzes.map((_, idx) => {
            const isCorrect = userAnswers[idx] === true;
            const isWrong = userAnswers[idx] === false;
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setFeedback(null);
                }}
                className={`w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center border-2 ${
                  isCorrect
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isWrong
                      ? "bg-rose-500 border-rose-500 text-white"
                      : isCurrent
                        ? "bg-white border-rose-400 text-rose-500 shadow-md scale-110"
                        : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-rose-50"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-bold text-rose-200 text-6xl -z-10 select-none">
                Q{currentIndex + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Câu hỏi {currentIndex + 1}/{quizzes.length}
              </h3>
              <p className="text-lg text-rose-600 font-medium leading-relaxed">
                {quizzes[currentIndex].question}
              </p>

              {quizzes[currentIndex].hint && !feedback && (
                <div className="mt-4">
                  {showHint ? (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic"
                    >
                      💡 Gợi ý: {quizzes[currentIndex].hint}
                    </motion.p>
                  ) : (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-sm text-amber-600 hover:text-amber-700 underline font-medium"
                    >
                      Xem gợi ý?
                    </button>
                  )}
                </div>
              )}
            </div>

            {!feedback ? (
              <div className="grid grid-cols-1 gap-3">
                {shuffledOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left px-6 py-4 rounded-xl border-2 border-rose-100 hover:border-rose-400 hover:bg-rose-50 transition-all text-lg shadow-sm font-medium text-gray-700"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center gap-4 ${
                  feedback.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {feedback.isCorrect ? (
                  <CheckCircle2 size={48} />
                ) : (
                  <XCircle size={48} />
                )}
                <p className="text-xl font-bold leading-snug">
                  {feedback.message}
                </p>
                <div className="flex gap-4">
                  {!feedback.isCorrect && (
                    <button
                      onClick={() => setFeedback(null)}
                      className="px-6 py-3 rounded-full font-bold text-rose-600 border-2 border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                    >
                      Thử lại
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-md transition-all ${
                      feedback.isCorrect
                        ? "bg-emerald-500 hover:bg-emerald-600"
                        : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    {currentIndex < quizzes.length - 1
                      ? "Câu tiếp theo"
                      : "Xem kết quả"}
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-10 space-y-6"
          >
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 ${isPass ? "bg-emerald-100 text-emerald-500" : "bg-rose-100 text-rose-500"}`}
            >
              {isPass ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
            </div>
            <h3
              className={`text-3xl font-bold ${isPass ? "text-emerald-700" : "text-rose-700"}`}
            >
              {isPass ? "Tuyệt vời quá! ❤️" : "Cố gắng lên nhé!"}
            </h3>

            <div className="space-y-2">
              <p className="text-4xl font-black text-rose-500">
                {correctCount}/{quizzes.length}
              </p>
              <p className="text-gray-600 font-medium">
                Đúng {percentage}% câu hỏi
              </p>
            </div>

            <p className="text-gray-600 text-lg px-4 italic leading-relaxed">
              {isPass
                ? "Bạn thật sự hiểu đối phương rất nhiều luôn á! Hai bạn sinh ra là dành cho nhau rồi. Chúc mừng hai bạn nhé! ❤️"
                : "Chời ơi trả lời hỏng đúng 80% luôn á bà nọi, chơi lại đi 😒"}
            </p>

            {!isPass && (
              <button
                onClick={restart}
                className="mt-4 flex items-center gap-2 px-10 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all mx-auto"
              >
                <RefreshCcw size={20} />
                Chơi lại
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
