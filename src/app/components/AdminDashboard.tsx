import React, { useEffect, useState } from "react";
import {
  fetchImages as fetchImagesApi,
  createImage as createImageApi,
  updateImage as updateImageApi,
  deleteImage as deleteImageApi,
  bulkReplaceImages,
} from "../api/images";
import {
  fetchTracks as fetchTracksApi,
  bulkReplaceTracks,
  type Track,
} from "../api/tracks";
import {
  fetchQuizzes as fetchQuizzesApi,
  bulkReplaceQuizzes,
  type QuizItem,
} from "../api/quiz";
import { Music, HelpCircle } from "lucide-react";
import { defaultImages, type GalleryImage } from "./ImageGallery";

interface EditableImage extends GalleryImage {
  id: string;
  _id?: string;
  pendingUploads?: { file: File; tempUrl: string }[];
  createdAt?: string;
}

interface EditableTrack extends Track {
  id: string;
  pendingUpload?: { file: File; tempUrl: string };
}

const STORAGE_KEY = "gallery_images";

function createId() {
  return Math.random().toString(36).substring(2, 9);
}

interface AdminDashboardProps {
  onBack?: () => void;
  onSaved?: () => void;
}

export function AdminDashboard({ onBack, onSaved }: AdminDashboardProps) {
  const [images, setImages] = useState<EditableImage[]>([]);
  const [tracks, setTracks] = useState<EditableTrack[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [activeTab, setActiveTab] = useState<"gallery" | "music" | "quiz">(
    "gallery",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(
    null,
  );
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(
    null,
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set());
  const [deletedTrackUrls, setDeletedTrackUrls] = useState<Set<string>>(
    new Set(),
  );
  const [optionsText, setOptionsText] = useState("");

  useEffect(() => {
    if (selectedQuizIndex !== null && quizzes[selectedQuizIndex]) {
      setOptionsText(quizzes[selectedQuizIndex].options?.join(", ") || "");
    } else {
      setOptionsText("");
    }
  }, [selectedQuizIndex]);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [serverImages, serverTracks, serverQuizzes] = await Promise.all([
          fetchImagesApi(),
          fetchTracksApi(),
          fetchQuizzesApi(),
        ]);
        if (cancelled) return;

        if (Array.isArray(serverImages) && serverImages.length > 0) {
          setImages(
            serverImages.map(
              (d) =>
                ({
                  id: createId(),
                  _id: d._id,
                  title: d.title || "",
                  description: d.description || "",
                  urls: d.url ? [d.url] : d.urls || [],
                  createdAt: d.createdAt,
                }) as EditableImage,
            ),
          );
        } else {
          setImages(
            defaultImages.map((img: GalleryImage) => ({
              ...img,
              id: createId(),
            })),
          );
        }

        if (Array.isArray(serverTracks)) {
          setTracks(
            serverTracks.map(
              (t) =>
                ({
                  id: createId(),
                  _id: t._id,
                  title: t.title || "",
                  artist: t.artist || "",
                  url: t.url || "",
                }) as EditableTrack,
            ),
          );
        }

        if (Array.isArray(serverQuizzes)) {
          setQuizzes(
            serverQuizzes.map((q) => ({
              ...q,
              id: createId(),
            })),
          );
        }
      } catch (e) {
        console.error("Load data error:", e);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange =
    (index: number, field: keyof GalleryImage) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setImages((prev: EditableImage[]) =>
        prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
      );
    };

  const handleAdd = () => {
    const newImage: EditableImage = {
      id: createId(),
      title: "Tiêu đề mới",
      description: "Mô tả ở đây…",
      urls: [],
    };
    setImages((prev) => [...prev, newImage]);
    setSelectedIndex(images.length);
  };

  const handleDelete = (index: number) => {
    (async () => {
      try {
        const imageToDelete = images[index];
        if (imageToDelete?._id) {
          await deleteImageApi(imageToDelete._id);
        }
        setImages((prev) => prev.filter((_, i) => i !== index));
        setSelectedIndex(null);
        setSuccessMessage("✓ Xóa sản phẩm thành công!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Error deleting image:", err);
        setSuccessMessage("❌ Lỗi khi xóa sản phẩm");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    })();
  };

  const handleSave = () => {
    (async () => {
      setIsSaving(true);
      try {
        // 1. Upload pending images
        const updatedImages = [...images];
        let totalToUpload = 0;
        updatedImages.forEach((img) => {
          totalToUpload += img.pendingUploads?.length || 0;
        });

        // Track uploads
        const updatedTracks = [...tracks];
        updatedTracks.forEach((t) => {
          if (t.pendingUpload) totalToUpload++;
        });

        if (totalToUpload > 0) {
          setUploadingCount(totalToUpload);

          // Images upload logic (kept same as before)
          for (let i = 0; i < updatedImages.length; i++) {
            const img = updatedImages[i];
            if (img.pendingUploads && img.pendingUploads.length > 0) {
              const newUrls = [...img.urls];
              for (const { file, tempUrl } of img.pendingUploads) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", uploadPreset!);
                formData.append("folder", "VLTWebsite");
                const res = await fetch(
                  `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                  { method: "POST", body: formData },
                );
                const data = (await res.json()) as { secure_url?: string };
                if (data.secure_url) {
                  const urlIdx = newUrls.indexOf(tempUrl);
                  if (urlIdx !== -1) newUrls[urlIdx] = data.secure_url;
                  URL.revokeObjectURL(tempUrl);
                }
              }
              updatedImages[i] = { ...img, urls: newUrls, pendingUploads: [] };
            }
          }

          // Track upload logic
          for (let i = 0; i < updatedTracks.length; i++) {
            const track = updatedTracks[i];
            if (track.pendingUpload) {
              const { file, tempUrl } = track.pendingUpload;
              const formData = new FormData();
              formData.append("file", file);
              formData.append("upload_preset", uploadPreset!);
              formData.append("folder", "VLTWebsite/Music");
              formData.append("resource_type", "video"); // Essential for MP3

              const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                { method: "POST", body: formData },
              );
              const data = (await res.json()) as { secure_url?: string };
              if (data.secure_url) {
                updatedTracks[i] = {
                  ...track,
                  url: data.secure_url,
                  pendingUpload: undefined,
                };
                URL.revokeObjectURL(tempUrl);
              }
            }
          }
        }

        // 2. Preparation for DB save
        const [insertedImages, insertedTracks, insertedQuizzes] =
          await Promise.all([
            bulkReplaceImages(
              updatedImages.map((img) => ({
                title: img.title,
                description: img.description,
                urls: img.urls,
                createdAt: img.createdAt,
              })),
              Array.from(deletedUrls),
            ),
            bulkReplaceTracks(
              updatedTracks.map((t) => ({
                title: t.title,
                artist: t.artist,
                url: t.url,
              })),
              Array.from(deletedTrackUrls),
            ),
            bulkReplaceQuizzes(
              quizzes.map((q) => ({
                question: q.question,
                answer: q.answer,
                options: q.options || [],
                hint: q.hint || "",
                correctResponse: q.correctResponse,
                incorrectResponse: q.incorrectResponse,
              })),
            ),
          ]);

        // 3. Update local state
        if (Array.isArray(insertedImages)) {
          setImages(
            insertedImages.map((d, idx) => ({
              id: createId(),
              _id: d._id,
              title: d.title || "",
              description: d.description || "",
              urls: d.urls || [],
              createdAt: d.createdAt,
              pendingUploads: [],
            })),
          );
        }
        if (Array.isArray(insertedTracks)) {
          setTracks(
            insertedTracks.map((t) => ({
              id: createId(),
              _id: t._id,
              title: t.title || "",
              artist: t.artist || "",
              url: t.url || "",
            })),
          );
        }
        if (Array.isArray(insertedQuizzes)) {
          setQuizzes(
            insertedQuizzes.map((q) => ({
              ...q,
              id: createId(),
            })),
          );
        }

        setDeletedUrls(new Set());
        setDeletedTrackUrls(new Set());
        setSuccessMessage("✓ Lưu thành công!");
        setTimeout(() => setSuccessMessage(null), 3000);
        if (typeof onSaved === "function") onSaved();
      } catch (err) {
        console.error("Save error:", err);
        setSuccessMessage("❌ Lỗi khi lưu thay đổi");
        setTimeout(() => setSuccessMessage(null), 3000);
      } finally {
        setIsSaving(false);
        setUploadingCount(0);
      }
    })();
  };

  const handleUpload =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const newPendingUploads = fileArray.map((file) => ({
        file,
        tempUrl: URL.createObjectURL(file),
      }));

      setImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? {
                ...img,
                urls: [...img.urls, ...newPendingUploads.map((p) => p.tempUrl)],
                pendingUploads: [
                  ...(img.pendingUploads || []),
                  ...newPendingUploads,
                ],
              }
            : img,
        ),
      );

      setSuccessMessage(`✓ Đã thêm ${fileArray.length} ảnh vào danh sách chờ!`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset input file value to allow selecting same files again
      e.target.value = "";
    };

  const handleDeleteImage = (itemIndex: number, imageUrlIndex: number) => {
    const urlToDelete = images[itemIndex]?.urls[imageUrlIndex];
    if (urlToDelete) {
      // Chỉ thêm vào deletedUrls nếu là URL thực tế (không phải blob)
      if (!urlToDelete.startsWith("blob:")) {
        setDeletedUrls((prev) => new Set([...prev, urlToDelete]));
      }
    }
    setImages((prev) =>
      prev.map((img, i) =>
        i === itemIndex
          ? {
              ...img,
              urls: img.urls.filter((_, idx) => idx !== imageUrlIndex),
              pendingUploads: img.pendingUploads?.filter(
                (p) => p.tempUrl !== urlToDelete,
              ),
            }
          : img,
      ),
    );
  };

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handleAddTrack = () => {
    const newTrack: EditableTrack = {
      id: createId(),
      title: "Bài hát mới",
      artist: "Ca sĩ",
      url: "",
    };
    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrackIndex(tracks.length);
  };

  const handleDeleteTrack = (index: number) => {
    const trackToDelete = tracks[index];
    if (trackToDelete?.url && !trackToDelete.url.startsWith("blob:")) {
      setDeletedTrackUrls((prev) => new Set([...prev, trackToDelete.url]));
    }
    setTracks((prev) => prev.filter((_, i) => i !== index));
    setSelectedTrackIndex(null);
  };

  const handleUploadTrack =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const tempUrl = URL.createObjectURL(file);
      setTracks((prev) =>
        prev.map((track, i) =>
          i === index
            ? { ...track, url: tempUrl, pendingUpload: { file, tempUrl } }
            : track,
        ),
      );

      setSuccessMessage("✓ Đã thêm file nhạc vào danh sách chờ!");
      setTimeout(() => setSuccessMessage(null), 3000);
      e.target.value = "";
    };

  const handleChangeTrack = (
    index: number,
    field: keyof Track,
    value: string,
  ) => {
    setTracks((prev) =>
      prev.map((track, i) =>
        i === index ? { ...track, [field]: value } : track,
      ),
    );
  };

  const handleAddQuiz = () => {
    const newQuiz: QuizItem = {
      id: createId(),
      question: "Câu hỏi mới",
      answer: "Đáp án",
      options: [],
      hint: "",
      correctResponse: "Chính xác! Bạn tuyệt vời quá ❤️",
      incorrectResponse: "Sai rồi, thử lại nhé bạn ơi 😅",
    };
    setQuizzes((prev) => [...prev, newQuiz]);
    setSelectedQuizIndex(quizzes.length);
  };

  const handleDeleteQuiz = (index: number) => {
    setQuizzes((prev) => prev.filter((_, i) => i !== index));
    setSelectedQuizIndex(null);
  };

  const handleChangeQuiz = (
    index: number,
    field: keyof QuizItem,
    value: string,
  ) => {
    setQuizzes((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-rose-700 mb-2">
              📸 Quản lý Gallery
            </h1>
            <p className="text-gray-600">
              Quản lý sản phẩm và tải lên nhiều hình ảnh cho mỗi sản phẩm
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white font-medium transition"
            >
              ← Quay lại
            </button>
          )}
        </div>

        {/* Success Message - Fixed Center */}
        {successMessage && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="rounded-full bg-emerald-50 border-2 border-emerald-400 px-8 py-4 text-emerald-700 font-bold text-lg shadow-2xl animate-bounce">
              ✅ {successMessage}
            </div>
          </div>
        )}

        {/* Warning */}
        {(!cloudName || !uploadPreset) && (
          <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800 shadow-md">
            ⚠️ Thiếu cấu hình Cloudinary. Vui lòng kiểm tra file{" "}
            <code className="font-mono">.env.local</code>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === "gallery" ? "bg-rose-500 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-rose-50"}`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("music")}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === "music" ? "bg-rose-500 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-rose-50"}`}
          >
            Âm nhạc
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === "quiz" ? "bg-rose-500 text-white shadow-lg" : "bg-white text-gray-600 hover:bg-rose-50"}`}
          >
            Love Quiz
          </button>
        </div>

        {activeTab === "gallery" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* List Panel */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Danh sách sản phẩm
                  </h2>
                  <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-sm font-medium">
                    {images.length}
                  </span>
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full mb-4 rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow transition"
                >
                  + Thêm sản phẩm
                </button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      onClick={() => setSelectedIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedIndex === index
                          ? "bg-rose-100 border-2 border-rose-500"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {img.urls.length > 0 && (
                          <img
                            src={img.urls[0]}
                            alt={img.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate text-sm">
                            {img.title || "Chưa có tiêu đề"}
                          </p>
                          <p className="text-xs text-gray-500">
                            📸 {img.urls.length} ảnh
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Panel */}
            <div className="lg:col-span-2">
              {selectedImage ? (
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedImage.title}
                    </h2>
                    <button
                      onClick={() => handleDelete(selectedIndex!)}
                      className="rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-sm font-medium transition"
                    >
                      🗑️ Xóa sản phẩm
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tiêu đề
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={selectedImage.title}
                        onChange={handleChange(selectedIndex!, "title")}
                        placeholder="Nhập tiêu đề..."
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={selectedImage.description}
                        onChange={handleChange(selectedIndex!, "description")}
                        placeholder="Nhập mô tả..."
                      />
                    </div>

                    {/* Images List */}
                    {selectedImage.urls.length > 0 && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                          Danh sách ảnh ({selectedImage.urls.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedImage.urls.map((url, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative group rounded-lg overflow-hidden border border-gray-200"
                            >
                              <img
                                src={url}
                                alt={`${selectedImage.title}-${imgIdx}`}
                                className="w-full h-32 object-cover"
                              />
                              <button
                                onClick={() =>
                                  handleDeleteImage(selectedIndex!, imgIdx)
                                }
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <span className="text-white text-2xl">🗑️</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload Section */}
                    <div className="rounded-lg bg-rose-50 p-4">
                      <label className="block text-sm font-semibold text-rose-700 mb-3">
                        📤 Upload nhiều ảnh cùng lúc
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload(selectedIndex!)}
                        id={`file-input-${selectedIndex}`}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(`file-input-${selectedIndex}`)
                            ?.click()
                        }
                        disabled={isSaving}
                        className="w-full rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow hover:shadow-md transition"
                      >
                        📁 Chọn thêm ảnh (Lưu sau)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-12 shadow-lg flex items-center justify-center min-h-96">
                  <p className="text-center text-gray-500">
                    👈 Chọn một sản phẩm từ danh sách để chỉnh sửa
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "music" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Music List */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Danh sách nhạc
                  </h2>
                  <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-sm font-medium">
                    {tracks.length}
                  </span>
                </div>

                <button
                  onClick={handleAddTrack}
                  className="w-full mb-4 rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow transition"
                >
                  + Thêm bài hát
                </button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tracks.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => setSelectedTrackIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedTrackIndex === index
                          ? "bg-rose-100 border-2 border-rose-500"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                          <Music size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate text-sm">
                            {track.title || "Chưa có tên"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {track.artist || "Chưa có ca sĩ"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Music Edit Panel */}
            <div className="lg:col-span-2">
              {selectedTrackIndex !== null ? (
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Chỉnh sửa bài hát
                    </h2>
                    <button
                      onClick={() => handleDeleteTrack(selectedTrackIndex!)}
                      className="rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-sm font-medium transition"
                    >
                      🗑️ Xóa bài hát
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên bài hát
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={tracks[selectedTrackIndex!].title}
                        onChange={(e) =>
                          handleChangeTrack(
                            selectedTrackIndex!,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ca sĩ
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={tracks[selectedTrackIndex!].artist}
                        onChange={(e) =>
                          handleChangeTrack(
                            selectedTrackIndex!,
                            "artist",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="rounded-lg bg-rose-50 p-4">
                      <label className="block text-sm font-semibold text-rose-700 mb-3">
                        📤 Upload File Nhạc (.mp3)
                      </label>
                      <input
                        type="file"
                        accept="audio/mpeg"
                        onChange={handleUploadTrack(selectedTrackIndex!)}
                        id="track-file-input"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("track-file-input")?.click()
                        }
                        className="w-full rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow transition mb-4"
                      >
                        📁 Chọn file MP3
                      </button>

                      {tracks[selectedTrackIndex!].url && (
                        <div className="p-3 bg-white rounded-lg border border-rose-100">
                          <p className="text-xs text-gray-500 mb-2">Preview:</p>
                          <audio
                            controls
                            src={tracks[selectedTrackIndex!].url}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-12 shadow-lg flex items-center justify-center min-h-96">
                  <p className="text-center text-gray-500">
                    👈 Chọn một bài hát để bắt đầu thiết lập
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quiz List */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Danh sách câu hỏi
                  </h2>
                  <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-sm font-medium">
                    {quizzes.length}
                  </span>
                </div>

                <button
                  onClick={handleAddQuiz}
                  className="w-full mb-4 rounded-lg bg-rose-500 hover:bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow transition"
                >
                  + Thêm câu hỏi
                </button>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {quizzes.map((quiz, index) => (
                    <div
                      key={quiz.id}
                      onClick={() => setSelectedQuizIndex(index)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        selectedQuizIndex === index
                          ? "bg-rose-100 border-2 border-rose-500"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                          <HelpCircle size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate text-sm">
                            {quiz.question || "Chưa có nội dung"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiz Edit Panel */}
            <div className="lg:col-span-2">
              {selectedQuizIndex !== null ? (
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Chỉnh sửa câu hỏi
                    </h2>
                    <button
                      onClick={() => handleDeleteQuiz(selectedQuizIndex!)}
                      className="rounded-lg bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 text-sm font-medium transition"
                    >
                      🗑️ Xóa câu hỏi
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Câu hỏi
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        rows={2}
                        value={quizzes[selectedQuizIndex!].question}
                        onChange={(e) =>
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "question",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Đáp án chính xác
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={quizzes[selectedQuizIndex!].answer}
                        onChange={(e) =>
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "answer",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Đáp án khác (Cách nhau bởi dấu phẩy)
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        value={optionsText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOptionsText(val);
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "options" as any,
                            val
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s !== "") as any,
                          );
                        }}
                        placeholder="Ví dụ: Đáp án 1, Đáp án 2..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">
                        Gợi ý cho câu hỏi
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-amber-300 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
                        value={quizzes[selectedQuizIndex!].hint || ""}
                        onChange={(e) =>
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "hint",
                            e.target.value,
                          )
                        }
                        placeholder="Nhập gợi ý tại đây..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Lời đối đáp khi trả lời ĐÚNG
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-emerald-300 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
                        rows={2}
                        value={quizzes[selectedQuizIndex!].correctResponse}
                        onChange={(e) =>
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "correctResponse",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-rose-700 mb-2">
                        Lời đối đáp khi trả lời SAI
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-rose-300 px-4 py-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
                        rows={2}
                        value={quizzes[selectedQuizIndex!].incorrectResponse}
                        onChange={(e) =>
                          handleChangeQuiz(
                            selectedQuizIndex!,
                            "incorrectResponse",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white p-12 shadow-lg flex items-center justify-center min-h-96">
                  <p className="text-center text-gray-500">
                    👈 Chọn một câu hỏi để bắt đầu thiết lập
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60 transition"
          >
            {isSaving
              ? uploadingCount > 0
                ? `⏳ Đang upload ${uploadingCount} ảnh...`
                : "⏳ Đang lưu dữ liệu..."
              : "✓ Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
