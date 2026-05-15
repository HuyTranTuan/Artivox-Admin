import React from "react";

export default function Loading({
  // You can change these variables to test different themes
  theme = {
    primary: "#ff6600", // Neon Orange
    secondary: "#050505", // Deep black
    bg: "#ffffff", // Crisp White
  },
}) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen font-mono transition-colors duration-500"
      style={{
        backgroundColor: theme.bg,
        "--primary-color": theme.primary,
        "--secondary-color": theme.secondary,
      }}
    >
      {}
      <style>{`
        @keyframes orbit-sync {
          0% { transform: rotate(0deg); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          50% { transform: rotate(180deg); border-radius: 50%; }
          100% { transform: rotate(360deg); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 5px var(--primary-color)); opacity: 0.8; }
          50% { filter: drop-shadow(0 0 15px var(--primary-color)); opacity: 1; }
        }
        .animate-orbit { animation: orbit-sync 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .border-theme { border-color: var(--primary-color); }
        .text-theme-primary { color: var(--primary-color); }
        .text-theme-secondary { color: var(--secondary-color); }
      `}</style>

      {}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Orbit Ring */}
        <div className="absolute inset-0 border-2 border-theme opacity-20 rounded-full" style={{ borderStyle: "double", borderWidth: "4px" }}></div>

        {/* The Moving Element (The Orbit) */}
        <div className="absolute inset-0 p-1 animate-orbit">
          <div className="w-4 h-4 rounded-full animate-glow" style={{ backgroundColor: theme.primary }}></div>
        </div>

        {/* Central Core Icon (SVG) */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>

      {}
      <div className="mt-8 text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm tracking-[0.5em] font-bold uppercase text-theme-secondary">Loading</span>
          {/* Animated Dots */}
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce"></span>
          </div>
        </div>

        {/* Decorative line */}
        <div className="w-16 h-px mx-auto opacity-30" style={{ backgroundColor: theme.primary }}></div>

        <p className="text-[10px] tracking-widest text-theme-primary opacity-60 uppercase">System Initialization</p>
      </div>

      {}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: `linear-gradient(to bottom, transparent 50%, #000 50%)`,
          backgroundSize: "100% 4px",
        }}
      ></div>
    </div>
  );
}
