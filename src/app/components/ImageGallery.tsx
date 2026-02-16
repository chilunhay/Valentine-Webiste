import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface GalleryImage {
  urls: string[];
  title: string;
  description: string;
  createdAt?: string;
}

// Dữ liệu mặc định, sẽ có thể bị override bởi Admin qua localStorage
export const defaultImages: GalleryImage[] = [];

// Các ảnh kỷ niệm riêng của hai bạn.
// Hãy lưu 7 bức ảnh ở thư mục `public/images` với tên giống mảng dưới đây
// để chúng hiện ra trong khung chọn ảnh.
export const personalPhotos: string[] = [];

interface ImageGalleryProps {
  onSelectImage: (image: GalleryImage) => void;
  images?: GalleryImage[];
  sortOrder: "newest" | "oldest";
  onSortOrderChange: (order: "newest" | "oldest") => void;
}

export function ImageGallery({
  onSelectImage,
  images,
  sortOrder,
  onSortOrderChange,
}: ImageGalleryProps) {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (index: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(index)) {
        newFavorites.delete(index);
      } else {
        newFavorites.add(index);
      }
      return newFavorites;
    });
  };

  const galleryImages = images ?? defaultImages;

  // Trang gallery mặc định
  return (
    <div
      id="gallery"
      className="py-16 px-6 bg-gradient-to-b from-white to-pink-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4 text-rose-600">
            Khoảnh khắc kỷ niệm
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Nơi lưu giữ những kỷ niệm đẹp đẽ của chúng mình ❤️
          </p>

          {/* Sort Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => onSortOrderChange("newest")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                sortOrder === "newest"
                  ? "bg-rose-500 text-white shadow-lg"
                  : "bg-white text-rose-400 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => onSortOrderChange("oldest")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                sortOrder === "oldest"
                  ? "bg-rose-500 text-white shadow-lg"
                  : "bg-white text-rose-400 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              Cũ nhất
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryImages
            .filter((image) => image.urls && image.urls.length > 0)
            .map((image, index) => (
              <div
                key={`${image.title}-${index}`}
                onClick={() => onSelectImage(image)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white cursor-pointer"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <ImageWithFallback
                    src={image.urls[0]}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl mb-2">{image.title}</h3>
                    <p className="text-sm text-gray-200">{image.description}</p>
                    <p className="text-xs text-gray-300 mt-2">
                      📸 {image.urls.length} hình ảnh
                    </p>
                  </div>
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavorite(index);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg z-10"
                  aria-label="Toggle favorite"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-200 ${
                      favorites.has(index)
                        ? "text-red-500 fill-red-500 scale-110"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
