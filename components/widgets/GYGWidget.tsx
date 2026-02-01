// components/widgets/GYGWidget.tsx
"use client";

import { useEffect } from "react";

interface GYGWidgetProps {
  destination: string;
}

export default function GYGWidget({ destination }: GYGWidgetProps) {
  useEffect(() => {
    // Sprawdź czy skrypt już istnieje
    const existingScript = document.querySelector(
      'script[src*="widget.getyourguide.com"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
      script.async = true;
      script.setAttribute("data-gyg-partner-id", "6QOAHMH");
      document.body.appendChild(script);
    }

    // Wymuś przeładowanie widgetu jeśli destination się zmienia
    const timer = setTimeout(() => {
      if (window.gyg && typeof window.gyg.Widget === "function") {
        window.gyg.Widget.reload();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination]);

  return (
    <section className="glass-card w-full p-8 text-center">
      <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">
        Polecane atrakcje
      </h3>
      <h4 className="text-white text-base mb-6">
        Zarezerwuj bilety online i nie trać ani minuty na stanie w kasach.
      </h4>
      <div
        data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
        data-gyg-locale-code="pl-PL"
        data-gyg-widget="activities"
        data-gyg-number-of-items="3"
        data-gyg-partner-id="6QOAHMH"
        data-gyg-q={destination}
        className="w-full min-h-[200px]"
      />
    </section>
  );
}

// Rozszerzenie Window dla TypeScript
declare global {
  interface Window {
    gyg?: any;
  }
}
