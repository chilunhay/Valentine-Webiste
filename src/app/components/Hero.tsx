import { Heart, LogOut, Settings, Gift, HelpCircle } from "lucide-react";
import React from "react";

interface HeroProps {
  onOpenAdmin: () => void;
  onOpenTimeline: () => void;
  onOpenCountdown: () => void;
  onOpenSecretBox: () => void;
  onOpenQuiz: () => void;
  isAdmin?: boolean;
}

export function Hero({
  onOpenAdmin,
  onOpenTimeline,
  onOpenCountdown,
  onOpenSecretBox,
  onOpenQuiz,
  isAdmin = false,
}: HeroProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("valentines_auth");
    window.location.reload();
  };

  return (
    <div className="relative min-h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden py-12 md:py-0">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 animate-fade-in-up w-full max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 font-dancing drop-shadow-lg leading-tight">
          Happy Valentine's Day
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-light mb-8 opacity-90 px-4">
          Lưu giữ những khoảnh khắc ngọt ngào nhất của chúng mình ✨
        </p>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
          <button
            onClick={() => {
              const gallery = document.getElementById("gallery");
              gallery?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 sm:px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            Xem Ảnh
          </button>

          {onOpenTimeline && (
            <button
              onClick={onOpenTimeline}
              className="px-6 sm:px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/50 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base"
            >
              Hành trình
            </button>
          )}

          {onOpenCountdown && (
            <button
              onClick={onOpenCountdown}
              className="px-6 sm:px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/50 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base"
            >
              Đếm ngược
            </button>
          )}

          {onOpenSecretBox && (
            <button
              onClick={onOpenSecretBox}
              className="px-6 sm:px-8 py-3 bg-rose-400 hover:bg-rose-500 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base"
            >
              <Gift size={18} className="sm:w-5 sm:h-5" />
              Hộp bí mật
            </button>
          )}

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-6 sm:px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/50 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base"
            >
              <HelpCircle size={18} className="sm:w-5 sm:h-5" />
              Trắc nghiệm
            </button>
          )}
        </div>
      </div>

      {/* Settings Dropdown */}
      <div className="absolute top-4 right-4 z-50" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 transition-colors rounded-full ${isMenuOpen ? "bg-white text-rose-500" : "text-white/70 hover:text-white"}`}
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-1 text-gray-800 animate-in fade-in slide-in-from-top-2 border border-rose-100 overflow-hidden">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-rose-500" />
                  <span>Admin Dashboard</span>
                </button>
                <div className="h-px bg-gray-100 my-1" />
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-rose-50 text-red-600 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
