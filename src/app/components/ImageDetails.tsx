import React, { useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "./ImageGallery";

interface ImageDetailsProps {
  image: GalleryImage;
  onBack: () => void;
  galleryImages: GalleryImage[];
  onChangeSelected: (image: GalleryImage) => void;
}

export function ImageDetails({
  image,
  onBack,
  galleryImages,
  onChangeSelected,
}: ImageDetailsProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  // Tìm index của sản phẩm hiện tại
  const currentProductIdx = galleryImages.findIndex(
    (g) => g.title === image.title && g.description === image.description,
  );

  // Hình ảnh hiện tại được hiển thị
  const displayImageUrl =
    image.urls?.[currentImageIdx] || image.urls?.[0] || "";

  const goPrevProduct = () => {
    if (currentProductIdx > 0) {
      setCurrentImageIdx(0);
      onChangeSelected(galleryImages[currentProductIdx - 1]);
    }
  };

  const goNextProduct = () => {
    if (
      currentProductIdx !== -1 &&
      currentProductIdx < galleryImages.length - 1
    ) {
      setCurrentImageIdx(0);
      onChangeSelected(galleryImages[currentProductIdx + 1]);
    }
  };

  const goPrevImage = () => {
    if (currentImageIdx > 0) setCurrentImageIdx(currentImageIdx - 1);
  };

  const goNextImage = () => {
    if (image.urls && currentImageIdx < image.urls.length - 1)
      setCurrentImageIdx(currentImageIdx + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button - Enhanced */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 mb-8"
        >
          <span className="text-2xl">←</span>
          <span>Quay lại Gallery</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* Left: Tiêu đề, mô tả, và điều hướng */}
          <div className="space-y-8">
            {/* Title Section */}
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-rose-400 mb-4 font-bold">
                💕 Khoảnh khắc quý giá
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-rose-700 mb-6 leading-tight">
                {image.title}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-rose-300 pl-4">
                {image.description}
              </p>
            </div>

            {/* Heart Quote */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-md">
              <Heart className="w-8 h-8 text-red-500 fill-red-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium italic">
                Gửi đến em, với tất cả trái tim của anh.
              </span>
            </div>

            {/* Product Navigation - Image Based */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">
                🎨 Khám phá những kỷ niệm khác
              </p>
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goPrevProduct}
                  disabled={currentProductIdx <= 0}
                  className="rounded-lg bg-rose-100 hover:bg-rose-200 disabled:bg-gray-100 px-4 py-3 text-rose-700 disabled:text-gray-400 font-bold transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Product Thumbnail Carousel */}
                <div className="flex-1 overflow-x-auto flex gap-3 pb-2">
                  {galleryImages.map((prod, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIdx(0);
                        onChangeSelected(prod);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-3 transition-all transform hover:scale-105 ${
                        idx === currentProductIdx
                          ? "border-rose-500 ring-2 ring-rose-300"
                          : "border-gray-300 hover:border-rose-200"
                      }`}
                    >
                      {prod.urls && prod.urls[0] ? (
                        <img
                          src={prod.urls[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          📸
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNextProduct}
                  disabled={
                    currentProductIdx === -1 ||
                    currentProductIdx >= galleryImages.length - 1
                  }
                  className="rounded-lg bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 px-4 py-3 text-white disabled:text-gray-500 font-bold transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                {currentProductIdx + 1} / {galleryImages.length}
              </p>
            </div>
          </div>

          {/* Right: Large Image Display */}
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-rose-200 aspect-video flex items-center justify-center bg-gray-50">
              <img
                src={displayImageUrl}
                alt={image.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image navigation within product */}
            {image.urls && image.urls.length > 1 && (
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">
                  📋 Xem các ảnh
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goPrevImage}
                    disabled={currentImageIdx <= 0}
                    className="rounded-lg bg-rose-50 hover:bg-rose-100 disabled:bg-gray-100 px-6 py-3 text-rose-700 disabled:text-gray-400 font-bold transition"
                  >
                    ← Trước
                  </button>
                  <span className="text-base font-semibold text-gray-700 min-w-max">
                    {currentImageIdx + 1} / {image.urls?.length || 0}
                  </span>
                  <button
                    type="button"
                    onClick={goNextImage}
                    disabled={
                      !image.urls || currentImageIdx >= image.urls.length - 1
                    }
                    className="rounded-lg bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 px-6 py-3 text-white disabled:text-gray-500 font-bold transition"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnail grid - show all images from current product */}
            {image.urls && image.urls.length > 1 && (
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold">
                  🗣️ Tất cả ảnh
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {image.urls &&
                    image.urls.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-3 transition-all transform hover:scale-105 ${
                          idx === currentImageIdx
                            ? "border-rose-500 ring-2 ring-rose-300"
                            : "border-gray-300 hover:border-rose-200"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${image.title}-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
