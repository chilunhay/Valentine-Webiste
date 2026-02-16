import { Heart } from "lucide-react";
import React from "react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-pink-100 via-red-100 to-rose-100 py-12 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        </div>
        <p className="text-lg text-rose-700 mb-2">
          Lan tỏa yêu thương hôm nay và mãi mãi
        </p>
        <p className="text-sm text-gray-600">
          Được tạo ra với tình yêu cho ngày Valentine 2026
        </p>
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
