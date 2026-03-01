// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import PlanForm from "@/components/PlanForm";
import Timeline from "@/components/Timeline";
import TravelTips from "@/components/TravelTips";
import LoadingModal from "@/components/LoadingModal";
import { PlanResponse } from "@/lib/types";
import { generateTravelPDF } from "@/lib/pdf/generateTravelPDF";

export default function Home() {
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sprawdź czy jest shared plan w URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get("id");

    if (planId) {
      loadSharedPlan(planId);
    }
  }, []);

  const loadSharedPlan = async (planId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/plan/${planId}`);
      const data = await res.json();

      if (data) {
        setPlanData(data);
      } else {
        setError("Nie znaleziono planu");
      }
    } catch (err) {
      console.error("Błąd ładowania planu:", err);
      setError("Nie udało się wczytać planu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (destination: string, days: number) => {
    setIsLoading(true);
    setError(null);
    setPlanData(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Błąd serwera");
      }

      const data: PlanResponse = await response.json();
      setPlanData(data);

      // Aktualizuj URL jeśli mamy ID
      if (data.id) {
        const newUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
        window.history.pushState({ path: newUrl }, "", newUrl);
      }

      // Scroll do wyniku
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err: any) {
      console.error("Błąd podczas generowania planu:", err);
      setError(err.message || "Wystąpił błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePlan = () => {
    if (planData?.id) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${planData.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert("✅ Link skopiowany do schowka!");
    }
  };

  const handleDownloadPDF = async () => {
    if (!planData) return;

    try {
      await generateTravelPDF(planData);
    } catch (error) {
      alert("Nie udało się wygenerować PDF. Spróbuj ponownie.");
    }
  };

  return (
    <main className="relative z-10 w-[90%] lg:w-full min-h-screen py-8 lg:px-8 mx-auto flex items-center">
      <div className="w-full max-w-[1024px] mx-auto flex flex-col">
        <LoadingModal isOpen={isLoading} />

        <header className="flex justify-between items-center text-white py-6 border-b border-white/10 mb-8">
          <p className="text-xl md:text-2xl font-extrabold tracking-tight">
            Co zobaczyć w....
          </p>
        </header>

        <div className="mb-12">
          <PlanForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <section id="result" className="w-full mt-8 space-y-8">
          {error && (
            <div className="text-red-400 p-10 text-center font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          {!planData && !error && !isLoading && (
            <div className="text-center">
              <i className="fas fa-map-marked-alt fa-3x text-white/20 mb-4"></i>
              <p className="text-lg text-white/60">
                Wypełnij formularz powyżej, aby zobaczyć swój plan.
              </p>
            </div>
          )}

          {planData && (
            <>
              <Timeline plan={planData.plan} />
              <TravelTips
                tips={planData.plan.travel_tips}
                cityName={planData.plan.days[0]?.location_en}
                countryName={planData.plan.country_en}
              />

              {/* Przyciski udostępniania i PDF */}
              <div className="flex justify-center gap-4 mt-8">
                {planData.id && (
                  <button
                    onClick={handleSharePlan}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 font-bold"
                  >
                    🔗 Kopiuj link do planu
                  </button>
                )}

                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2 font-bold"
                >
                  📄 Pobierz PDF
                </button>
              </div>

              {/* Przycisk "Zaplanuj kolejną podróż" */}
              <div className="w-full flex justify-center mt-12 mb-10 pb-10">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPlanData(null);
                  }}
                  className="group relative px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-green-400/30 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform duration-500">
                      🔄
                    </span>
                    <span className="text-white/80 font-medium tracking-wide group-hover:text-green-400 transition-colors">
                      Zaplanuj kolejną podróż
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
