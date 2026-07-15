"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function GetStartedButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group flex items-center gap-2 overflow-hidden rounded-full bg-white/10 px-6 py-3 text-white font-medium backdrop-blur-sm border border-white/20 transition-colors duration-500 hover:bg-white cursor-pointer"
    >
      {/* Expanding background circle */}
      <span
        className={`absolute inset-0 rounded-full bg-white transition-transform duration-700 ease-out ${
          hovered ? "scale-150" : "scale-0"
        }`}
        style={{ transformOrigin: "center" }}
      />

      {/* Text */}
      <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
        Get Started
      </span>

      {/* Arrow */}
      <ArrowRight
        className={`relative z-10 size-4 transition-all duration-500 group-hover:text-black ${
          hovered ? "translate-x-1" : "translate-x-0"
        }`}
      />
    </button>
  );
}
