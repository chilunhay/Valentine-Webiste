import React, { useState, useEffect, useRef } from "react";
import {
  Music,
  X,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";
import { fetchTracks, type Track } from "../api/tracks";

export function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTracks();
        if (Array.isArray(data) && data.length > 0) {
          setTracks(data);
        }
      } catch (e) {
        console.error("Failed to load tracks", e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((e) => console.error("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Playback failed", e));
    }
  }, [currentTrackIndex]);

  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] group">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 z-50 relative"
      >
        {isOpen ? <ChevronDown size={24} /> : <Music size={24} />}
        {isPlaying && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Player UI */}
      <div
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-100 overflow-hidden transition-all duration-500 ease-in-out w-[320px] ${
          isOpen
            ? "translate-y-0 opacity-100 max-h-[200px]"
            : "translate-y-10 opacity-0 max-h-0 pointer-events-none"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 ${isPlaying ? "animate-spin-slow" : ""}`}
            >
              <Music size={24} />
            </div>
            {currentTrack ? (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentTrack.artist}
                </p>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  Chưa có bài hát nào
                </p>
                <p className="text-xs text-gray-400">
                  Vào Admin để thêm nhạc nhé ❤️
                </p>
              </div>
            )}
          </div>

          {/* Seek Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTrack ? currentTime : 0}
              onChange={handleSeek}
              disabled={!currentTrack}
              className={`w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500 mb-1 ${!currentTrack ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={prevTrack}
                disabled={tracks.length <= 1}
                className="p-2 hover:bg-rose-50 rounded-full text-gray-600 disabled:opacity-30"
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={togglePlay}
                disabled={!currentTrack}
                className="p-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md disabled:bg-gray-300 disabled:shadow-none"
              >
                {isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} className="ml-0.5" />
                )}
              </button>
              <button
                onClick={nextTrack}
                disabled={tracks.length <= 1}
                className="p-2 hover:bg-rose-50 rounded-full text-gray-600 disabled:opacity-30"
              >
                <SkipForward size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 border-l pl-3 border-gray-100">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-rose-500"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-12 accent-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={nextTrack}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
