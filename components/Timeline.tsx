// components/Timeline.tsx
"use client";

import { TripPlan } from "@/lib/types";
import { marked } from "marked";
import Image from "next/image";

interface TimelineProps {
  plan: TripPlan;
}

export default function Timeline({ plan }: TimelineProps) {
  if (!plan || !plan.days) {
    return (
      <div className="text-center text-white/50 p-10">Błąd danych planu.</div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {plan.days.map((day, index) => {
        const isFirstDay = index === 0;

        return (
          <section
            key={day.day_number}
            id={`day-${day.day_number}`}
            className="glass-card w-full mb-10 scroll-mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left"
          >
            {isFirstDay && (
              <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-white uppercase tracking-tighter leading-tight">
                {plan.itinerary_title}
              </h2>
            )}

            <div className="flex items-center mb-8">
              <div className="bg-green-500 text-black font-black px-4 py-1.5 rounded-full text-xs mr-4 uppercase tracking-widest flex-shrink-0">
                Dzień {day.day_number}
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {day.location}
              </h3>
            </div>

            <div className="mb-10 w-full h-80 bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl">
              <Image
                src={day.imageUrl || "/images/image1.jpg"}
                alt={day.location}
                fill
                className="object-cover opacity-0 transition-all duration-1000 group-hover:scale-105"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = "1";
                }}
              />

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/70 border border-white/10">
                Foto:{" "}
                <a
                  href={day.photoAuthorLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-400"
                >
                  {day.photoAuthor || "Unknown"}
                </a>
              </div>
            </div>

            <div className="relative ml-4 border-l-2 border-white/10 pl-8 space-y-12">
              {day.activities.map((act, actIndex) => (
                <div key={actIndex} className="timeline-item relative">
                  <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-1">
                      <div className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">
                        {act.period}
                      </div>
                      <div className="text-sm font-mono text-white/50">
                        {act.time_range}
                      </div>
                    </div>
                    <div className="col-span-3 text-gray-200 leading-relaxed text-base md:text-lg">
                      <div
                        className="italic-markdown"
                        dangerouslySetInnerHTML={{
                          __html: marked(act.description) as unknown as string,
                        }}
                      />
                      {act.maps_url && (
                        <a
                          href={act.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-3 text-sm text-green-400 hover:text-green-300"
                        >
                          🗺️ Zobacz na mapie
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
