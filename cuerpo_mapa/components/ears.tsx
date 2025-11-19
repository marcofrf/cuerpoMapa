"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function EarsSketch() {
  const playlist = ["/audio/song1.wav", "/audio/song2.wav", "/audio/song3.wav"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playCurrentSong = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(playlist[currentIndex]);
    } else {
      audioRef.current.pause();
      audioRef.current = new Audio(playlist[currentIndex]);
    }
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleBack = () => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentIndex((currentIndex - 1 + playlist.length) % playlist.length);
  };

  const handlePlayPause = () => {
    if (!isPlaying) playCurrentSong();
    else pauseSong();
  };

  const handleForward = () => {
    if (audioRef.current) audioRef.current.pause();
    setCurrentIndex((currentIndex + 1) % playlist.length);
  };

  useEffect(() => {
    if (isPlaying) {
      playCurrentSong();
    }
  }, [currentIndex]);

  const songName =
    playlist[currentIndex].split("/").pop()?.replace(".wav", "") ?? "";

  return (
    <div className="flex flex-col items-center select-none gap-4">
      <div className="relative w-[35vw]">

        {/* FX IMAGE — SAME SIZE & POSITION AS RADIO */}
        <Image
          src="/images/radio/fx.png"
          alt="FX Pulse"
          width={800}
          height={600}
          className={`
            absolute inset-0 w-full h-auto 
            transition-all duration-[1800ms] ease-in-out
            ${isPlaying ? "opacity-100 scale-110" : "opacity-0 scale-100"}
          `}
          style={{
            animation: isPlaying
              ? "pulseFX 2s ease-in-out infinite"
              : "none",
          }}
        />

        {/* RADIO IMAGE */}
        <Image
          src="/images/radio/radio.png"
          alt="Radio"
          width={800}
          height={600}
          className="w-full h-auto relative z-10"
        />

        {/* PREVIOUS BUTTON */}
        <button
          onClick={handleBack}
          className="absolute z-20"
          style={{
            left: "25%",
            bottom: "15%",
            width: "12%",
            height: "12%",
          }}
        >
          <Image
            src="/images/radio/previous.png"
            alt="Previous"
            width={200}
            height={200}
            className="w-full h-full transition-transform duration-200 hover:scale-110"
          />
        </button>

        {/* PLAY / PAUSE BUTTON */}
        <button
          onClick={handlePlayPause}
          className="absolute z-20"
          style={{
            left: "43%",
            bottom: "15%",
            width: "14%",
            height: "14%",
          }}
        >
          <Image
            src={isPlaying ? "/images/radio/pause.png" : "/images/radio/play.png"}
            alt="Play/Pause"
            width={220}
            height={220}
            className="w-full h-full transition-transform duration-200 hover:scale-110"
          />
        </button>

        {/* NEXT BUTTON */}
        <button
          onClick={handleForward}
          className="absolute z-20"
          style={{
            left: "63%",
            bottom: "15%",
            width: "12%",
            height: "12%",
          }}
        >
          <Image
            src="/images/radio/next.png"
            alt="Next"
            width={200}
            height={200}
            className="w-full h-full transition-transform duration-200 hover:scale-110"
          />
        </button>
      </div>

      <div className="text-lg font-bold text-black tracking-wide">
        {songName}
      </div>

      {/* Local animation definition */}
      <style jsx>{`
        @keyframes pulseFX {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
