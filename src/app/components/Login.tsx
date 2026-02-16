import React, { useState } from "react";
import { Heart, Lock, Eye, EyeOff } from "lucide-react";
import couplePhoto from "../../assets/couple-photo.png";

type LoginMode = "user" | "admin";

interface LoginProps {
  onLogin: (mode: LoginMode) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === "17052025") {
      onLogin("user");
    } else if (password === "09092000") {
      onLogin("admin");
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setTimeout(() => setError(false), 3000);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-rose-200 flex items-center justify-center px-6">
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-red-300/20 fill-red-300/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header with couple photo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Couple photo with heart frame */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-red-400 shadow-xl">
                  <img
                    src={couplePhoto}
                    alt="Couple"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Heart overlay */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl mb-3 text-red-600">
              Ngày Valentine
            </h1>
            <p className="text-lg text-rose-600">
              Nhập mật mã bí mật để bắt đầu
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-gray-700"
              >
                Mật mã
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all pr-12 ${
                    error
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-red-300"
                  } ${isShaking ? "animate-shake" : ""}`}
                  placeholder="Nhập mật mã tại đây..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>❌</span> Mật mã không đúng. Thử lại nhé!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-rose-500 text-white py-3 rounded-xl hover:from-pink-600 hover:via-red-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>Mở khóa yêu thương</span>
            </button>
          </form>

          {/* Decorative hearts */}
          <div className="mt-8 flex justify-center gap-2">
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
            <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
          </div>
        </div>

        {/* Hint */}
        <p className="text-center mt-6 text-sm text-rose-700/70">
          Gợi ý: Một ngày đặc biệt để nhớ ✨
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
