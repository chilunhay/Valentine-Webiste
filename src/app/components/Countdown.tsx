import React, { useState, useEffect } from "react";
import { Heart, Calendar } from "lucide-react";

interface CountdownProps {
  onBack: () => void;
  startDate?: string; // Format: "YYYY-MM-DD"
}

export function Countdown({
  onBack,
  startDate = "2025-05-17",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = now - start;

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Hearts */}
      <div className="absolute top-20 left-10 text-rose-200 animate-pulse">
        <Heart size={100} fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-10 text-rose-200 animate-pulse delay-700">
        <Heart size={120} fill="currentColor" />
      </div>

      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-rose-500 font-semibold hover:text-rose-600 transition-colors"
      >
        <span className="text-2xl">←</span> Quay lại
      </button>

      <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-4xl w-full text-center relative z-10 border-4 border-rose-100">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Heart
              size={64}
              className="text-rose-500 animate-bounce"
              fill="currentColor"
            />
            <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
              YÊU
            </div>
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-serif italic">
          Chúng mình đã bên nhau được...
        </h2>

        <p className="text-rose-400 font-medium mb-12 flex items-center justify-center gap-2">
          <Calendar size={18} /> Kể từ ngày{" "}
          {new Date(startDate).toLocaleDateString("vi-VN")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <TimeUnit value={timeLeft.days} label="Ngày" />
          <TimeUnit value={timeLeft.hours} label="Giờ" />
          <TimeUnit value={timeLeft.minutes} label="Phút" />
          <TimeUnit value={timeLeft.seconds} label="Giây" />
        </div>

        <div className="mt-16 pt-8 border-t border-rose-100 text-gray-600 italic">
          "Trái tim này thuộc về hai đứa, mỗi giây trôi qua đều là món quà vô
          giá"
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-rose-50 rounded-2xl p-4 md:p-6 transition-transform hover:scale-105 border border-rose-100 shadow-sm">
      <div className="text-4xl md:text-6xl font-black text-rose-600 mb-2">
        {value.toLocaleString()}
      </div>
      <div className="text-sm md:text-base font-bold text-rose-400 uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}
