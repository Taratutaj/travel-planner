// components/TravelTips.tsx
"use client";

import { TravelTips as TravelTipsType } from "@/lib/types";

interface TravelTipsProps {
  tips: TravelTipsType;
}

export default function TravelTips({ tips }: TravelTipsProps) {
  if (!tips) return null;

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-3xl font-black text-white text-center mb-10 uppercase tracking-tighter">
        Praktyczne informacje
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before You Go */}
        <div className="glass-card p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <i className="fas fa-passport"></i> Zanim wyruszysz
          </h3>
          <div className="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p>
              <strong>Wiza i dokumenty:</strong> {tips.before_you_go.visa_docs}
            </p>
            <p>
              <strong>Zdrowie:</strong> {tips.before_you_go.health}
            </p>
            <p>
              <strong>Co zabrać:</strong> {tips.before_you_go.essentials}
            </p>
          </div>
        </div>

        {/* Transport */}
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <i className="fas fa-bus"></i> Transport
          </h3>
          <div className="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p>
              <strong>Z lotniska:</strong> {tips.transport.airport_transfer}
            </p>
            <p>
              <strong>Lokalnie:</strong> {tips.transport.local_transport}
            </p>
            <p>
              <strong>Wynajem:</strong> {tips.transport.rental_info}
            </p>
          </div>
        </div>

        {/* Finances */}
        <div className="glass-card p-6 border-l-4 border-yellow-500">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <i className="fas fa-wallet"></i> Finanse
          </h3>
          <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
            <p>
              <strong>Płatności:</strong> {tips.finances.currency_payments}
            </p>
            <div className="bg-white/5 p-3 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-yellow-500 block mb-1">
                Przykładowe ceny:
              </span>
              <ul className="list-disc ml-4 text-xs space-y-1">
                {tips.finances.example_prices.map((price, idx) => (
                  <li key={idx}>{price}</li>
                ))}
              </ul>
            </div>
            <p>
              <strong>Napiwki:</strong> {tips.finances.tipping_culture}
            </p>
          </div>
        </div>

        {/* Culture & Safety */}
        <div className="glass-card p-6 border-l-4 border-red-500">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <i className="fas fa-shield-alt"></i> Kultura i Bezpieczeństwo
          </h3>
          <div className="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p>
              <strong>Zwroty:</strong>{" "}
              <span className="italic text-white font-medium">
                {tips.culture_safety.phrases}
              </span>
            </p>
            <p>
              <strong>Etykieta:</strong> {tips.culture_safety.etiquette}
            </p>
            <p>
              <strong>Bezpieczeństwo:</strong>{" "}
              {tips.culture_safety.safety_scams}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
