// components/widgets/TravelpayoutsWidget.tsx
"use client";

import { useEffect } from "react";
import { getLocaleId } from "@/lib/cityData";

interface TravelpayoutsWidgetProps {
  cityName: string;
  countryName: string;
}

export default function TravelpayoutsWidget({
  cityName,
  countryName,
}: TravelpayoutsWidgetProps) {
  useEffect(() => {
    const localeId = getLocaleId(cityName, countryName);
    const containerId = "travelpayouts-container";
    const container = document.getElementById(containerId);

    if (!container) return;

    // Wyczyść kontener
    container.innerHTML = "";

    // Utwórz skrypt widgetu
    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = `https://trpwdg.com/content?currency=PLN&trs=488701&shmarker=633612&language=pl&locale=${localeId}&layout=horizontal&cards=4&powered_by=true&campaign_id=89&promo_id=3947`;

    container.appendChild(script);

    // Cleanup przy odmontowaniu
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [cityName, countryName]);

  return (
    <section className="glass-card w-full p-8 text-center">
      <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-4">
        Rezerwuj, póki są dostępne
      </h3>
      <h4 className="text-white text-base mb-6">
        Najpopularniejsze atrakcje w tym mieście wyprzedają się z wyprzedzeniem.
        Zabezpiecz swój termin już teraz.
      </h4>
      <div id="travelpayouts-container" className="w-full min-h-[200px]" />
    </section>
  );
}
