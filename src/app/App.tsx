import React, { useState, useEffect } from "react";
import { Hero } from "./components/Hero";
import {
  ImageGallery,
  personalPhotos,
  defaultImages,
  type GalleryImage,
} from "./components/ImageGallery";
import { ImageDetails } from "./components/ImageDetails";
import { AdminDashboard } from "./components/AdminDashboard";
import { Footer } from "./components/Footer";
import { Login } from "./components/Login";
import { Timeline } from "./components/Timeline";
import { MusicPlayer } from "./components/MusicPlayer";
import { Countdown } from "./components/Countdown";
import { SecretBox } from "./components/SecretBox";
import { LoveQuiz } from "./components/LoveQuiz";
import { SpecialSurprise } from "./components/SpecialSurprise";

type AuthMode = "user" | "admin";
type ViewMode =
  | "gallery"
  | "details"
  | "admin"
  | "timeline"
  | "countdown"
  | "secretbox"
  | "quiz"
  | "surprise";

export default function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] =
    useState<GalleryImage[]>(defaultImages);
  const [view, setView] = useState<ViewMode>("gallery");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const sortedGalleryImages = [...galleryImages].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
  });

  useEffect(() => {
    // Check if user is already logged in
    const auth = localStorage.getItem("valentines_auth");
    if (auth === "admin" || auth === "user" || auth === "true") {
      setAuthMode(auth === "admin" ? "admin" : "user");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Load images from backend API (extractable to manual refresh)
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `${(import.meta.env.VITE_API_URL as string) || ""}/api/images`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as any[];
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(
            (d) =>
              ({
                urls: d.url ? [d.url] : d.urls || [],
                title: d.title || "",
                description: d.description || "",
                createdAt: d.createdAt,
              }) as GalleryImage,
          );
          setGalleryImages(mapped);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Exposed to Admin to refresh gallery after save/seed
  const refreshGallery = async () => {
    try {
      const res = await fetch(
        `${(import.meta.env.VITE_API_URL as string) || ""}/api/images`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(
          (d) =>
            ({
              urls: d.url ? [d.url] : d.urls || [],
              title: d.title || "",
              description: d.description || "",
              createdAt: d.createdAt,
            }) as GalleryImage,
        );
        setGalleryImages(mapped);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Listen to server-sent events for seed/refresh notifications
    const base = (import.meta.env.VITE_API_URL as string) || "";
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${base}/api/events`);
      es.addEventListener("seed", () => {
        refreshGallery();
      });
      // also refresh on generic messages
      es.addEventListener("message", () => refreshGallery());
    } catch (e) {
      // ignore if EventSource not supported
    }
    return () => {
      if (es) es.close();
    };
  }, []);

  const handleLogin = (mode: AuthMode) => {
    localStorage.setItem("valentines_auth", mode);
    setAuthMode(mode);
    if (mode === "user") {
      setView("surprise");
    } else {
      setView("gallery");
    }
  };

  const handleSelectImage = (image: GalleryImage) => {
    setSelectedImage(image);
    setView("details");
    // Scroll thẳng vào phần trang giữa, bỏ qua Hero
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChangeSelected = (image: GalleryImage) => {
    setSelectedImage(image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackFromDetails = () => {
    setSelectedImage(null);
    setView("gallery");
  };

  const handleOpenAdmin = () => {
    setView("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenTimeline = () => {
    setView("timeline");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenCountdown = () => {
    setView("countdown");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenSecretBox = () => {
    setView("secretbox");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenQuiz = () => {
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return null;
  }

  if (!authMode) {
    return <Login onLogin={handleLogin} />;
  }

  if (view === "admin" && authMode === "admin") {
    return (
      <div className="min-h-screen bg-white">
        <AdminDashboard
          onBack={() => {
            setView("gallery");
          }}
          onSaved={refreshGallery}
        />
        <Footer />
        <MusicPlayer />
      </div>
    );
  }

  if (view === "details" && selectedImage) {
    return (
      <div className="min-h-screen bg-white">
        {/* Không render Hero, chỉ trang chi tiết + Footer */}
        <ImageDetails
          image={selectedImage}
          onBack={handleBackFromDetails}
          galleryImages={sortedGalleryImages}
          onChangeSelected={handleChangeSelected}
        />
        <Footer />
        <MusicPlayer />
      </div>
    );
  }

  if (view === "timeline") {
    return (
      <>
        <Timeline onBack={() => setView("gallery")} />
        <MusicPlayer />
      </>
    );
  }

  if (view === "countdown") {
    return (
      <>
        <Countdown onBack={() => setView("gallery")} />
        <MusicPlayer />
      </>
    );
  }

  if (view === "secretbox") {
    return (
      <>
        <SecretBox onBack={() => setView("gallery")} />
        <MusicPlayer />
      </>
    );
  }

  if (view === "quiz") {
    return (
      <div className="min-h-screen bg-rose-50/30 py-20 px-4">
        <div className="max-w-2xl mx-auto mb-8 flex justify-start">
          <button
            onClick={() => setView("gallery")}
            className="px-6 py-2 bg-white text-rose-500 font-bold rounded-full shadow-md hover:shadow-lg transition-all border border-rose-100 flex items-center gap-2"
          >
            ← Quay lại Gallery
          </button>
        </div>
        <LoveQuiz />
        <Footer />
        <MusicPlayer />
      </div>
    );
  }

  if (view === "surprise") {
    return <SpecialSurprise onClose={() => setView("gallery")} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Hero
        onOpenAdmin={handleOpenAdmin}
        onOpenTimeline={handleOpenTimeline}
        onOpenCountdown={handleOpenCountdown}
        onOpenSecretBox={handleOpenSecretBox}
        onOpenQuiz={handleOpenQuiz}
        isAdmin={authMode === "admin"}
      />
      <ImageGallery
        onSelectImage={handleSelectImage}
        images={sortedGalleryImages}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />
      <MusicPlayer />
      <Footer />
    </div>
  );
}
