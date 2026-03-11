// components/PremiumSection.tsx
"use client";

import { useState } from "react";

interface PremiumSectionProps {
  onActivate?: () => void;
}

const features = [
  { icon: "🗓️", text: "Plany nawet na 30-dniową podróż" },
  { icon: "✈️", text: "Wiele miast w jednym planie" },
  { icon: "⚡", text: "Intensywnie lub na luzie — Ty decydujesz" },
  { icon: "👶", text: "Atrakcje idealne dla rodzin z dziećmi" },
  { icon: "🐾", text: "Miejsca przyjazne dla czworonogów" },
  { icon: "📄", text: "Gotowy PDF i trasa w Google Maps" },
];

// Własny endpoint – działa nawet z addblockiem
const trackServer = (eventName: string, params?: Record<string, any>) => {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventName, params }),
  }).catch(() => {});
};

// GA4 – jako uzupełnienie
const trackGA4 = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
};

const trackEvent = (eventName: string, params?: Record<string, any>) => {
  trackServer(eventName, params); // zawsze
  trackGA4(eventName, params); // jeśli nie zablokowane
};

export default function PremiumSection({ onActivate }: PremiumSectionProps) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    trackEvent("premium_cta_clicked", {
      location: "main_page",
      button_label: "Aktywuj teraz i wybierz",
    });
    onActivate?.();
  };

  return (
    <section className="w-full mt-4">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Zielony blask w tle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(74,222,128,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Górna listwa akcentowa */}
        <div
          className="h-[2px] w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #4ade80, #22c55e, #4ade80, transparent)",
          }}
        />

        <div className="relative z-10 px-6 pt-5 pb-6">
          {/* Nagłówek */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">👑</span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                Przejdź na plan{" "}
                <span
                  style={{
                    color: "#4ade80",
                    textShadow: "0 0 18px rgba(74,222,128,0.35)",
                  }}
                >
                  Premium
                </span>
              </h2>
            </div>
            <p
              className="text-sm font-semibold tracking-widest uppercase"
              style={{ color: "rgba(129,199,132,0.85)" }}
            >
              14 dni za darmo
            </p>
          </div>

          {/* Siatka funkcji */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6 max-w-xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs"
                  style={{ background: "rgba(74,222,128,0.12)" }}
                >
                  {f.icon}
                </span>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <button
              onClick={handleClick}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="px-8 py-3 rounded-full font-bold text-sm md:text-base tracking-wide transition-all duration-300"
              style={{
                background: hovered
                  ? "linear-gradient(135deg, #4ade80, #22c55e)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                boxShadow: hovered
                  ? "0 0 28px rgba(74,222,128,0.45), 0 4px 20px rgba(0,0,0,0.3)"
                  : "0 4px 15px rgba(0,0,0,0.3)",
                transform: hovered ? "scale(1.04)" : "scale(1)",
              }}
            >
              <span className="flex items-center gap-2">
                <span>✨</span>
                Aktywuj teraz i wybierz
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
