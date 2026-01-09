// js/ui.js
import { travelFacts } from "./travelFacts.js";

// Eksportujemy obiekt UI
export const UI = {
  // Dynamiczne pobieranie elementów, aby uniknąć błędów "null"
  get elements() {
    return {
      form: document.getElementById("planForm"),
      result: document.getElementById("result"),
      submitBtn: document.getElementById("submitButton"),
      modal: document.getElementById("loadingModal"),
      fact: document.getElementById("travelFact"),
      progress: document.getElementById("progressBarFill"),
      destinationInput: document.getElementById("destination"),
      daysInput: document.getElementById("days"),
    };
  },

  showLoading() {
    const el = this.elements;

    // Sprawdzenie czy wszystkie kluczowe elementy istnieją
    if (!el.modal || !el.progress) {
      console.error("Błąd: Nie znaleziono elementów modala w HTML.");
      return;
    }

    // 1. NATYCHMIASTOWY RESET PASKA (bez animacji)
    el.progress.style.transition = "none"; // Wyłącz płynne przejście
    el.progress.style.width = "0%"; // Skocz do zera

    // Wymuszenie przeliczenia stylów (tzw. reflow), aby przeglądarka "zauważyła" zero
    el.progress.offsetHeight;

    // 2. PRZYWRÓCENIE ANIMACJI I WYŚWIETLENIE MODALA
    el.progress.style.transition = "width 10s ease-out";

    // Losowanie ciekawostki
    if (el.fact && travelFacts && travelFacts.length > 0) {
      el.fact.textContent =
        travelFacts[Math.floor(Math.random() * travelFacts.length)];
    }

    // Wyświetlanie modala (usuwamy klasę 'hidden' z Tailwinda i ustawiamy flex)
    el.modal.classList.remove("hidden");
    el.modal.style.display = "flex";

    if (el.submitBtn) el.submitBtn.disabled = true;

    // Animacja paska
    el.progress.style.width = "0%";
    setTimeout(() => {
      el.progress.style.width = "85%";
    }, 50);

    if (el.result) {
      el.result.innerHTML = `
        <div class="py-20 text-center animate-pulse text-white/50 text-xl tracking-widest uppercase italic">
          Generowanie Twojej przygody...
        </div>`;
    }
  },

  hideLoading() {
    const el = this.elements;
    if (!el.modal) return;

    el.progress.style.width = "100%";

    setTimeout(() => {
      el.modal.style.display = "none";
      el.modal.classList.add("hidden");
      if (el.submitBtn) el.submitBtn.disabled = false;
    }, 500);
  },

  renderTimeline(planData) {
    if (!planData || !planData.days) {
      return '<p class="text-center">Błąd danych planu.</p>';
    }

    let html = `
      <h2 class="text-3xl font-black mb-12 text-center text-white uppercase tracking-tighter">
        ${planData.itinerary_title}
      </h2>`;

    planData.days.forEach((day) => {
      html += `
        <div class="day-wrapper mb-16 text-left">
          <div class="flex items-center mb-6">
            <div class="bg-green-500 text-black font-black px-4 py-1 rounded-full text-sm mr-4 uppercase">
              Dzień ${day.day_number}
            </div>
            <h3 class="text-2xl font-bold text-white">${day.location}</h3>
          </div>

          <div class="mb-10 w-full h-80 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
            <img src="${day.imageUrl}" 
                 alt="${day.location}"
                 loading="lazy"
                 class="w-full h-full object-cover transition-opacity duration-700" 
                 onload="this.style.opacity='1'" 
                 style="opacity: 0.1;" />
            
            <div class="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/80">
              Foto: <a href="${
                day.photoAuthorLink
              }" target="_blank" class="underline hover:text-green-400">
                ${day.photoAuthor}
              </a>
            </div>
            
            <p class="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[12px] text-white/80">
               ${day.location_en || day.location}
            </p>
          </div>

          <div class="relative ml-6 border-l-2 border-white/10 pl-10 space-y-12">
            ${day.activities
              .map(
                (act) => `
              <div class="timeline-item relative">
                <div class="absolute -left-[49px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div class="col-span-1">
                    <div class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">
                      ${act.period}
                    </div>
                    <div class="text-sm font-mono text-white/60">
                      ${act.time_range}
                    </div>
                  </div>
                  <div class="col-span-3 text-gray-200 leading-relaxed text-lg italic-markdown">
                    ${marked.parse(act.description)}
                    ${
                      act.maps_url
                        ? `
                      <a href="${act.maps_url}"
                         target="_blank"
                         rel="noopener noreferrer"
                         class="inline-flex items-center gap-1 mt-2 text-sm text-green-400 hover:text-green-300">
                         📍 Zobacz na mapie
                      </a>`
                        : ""
                    }
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>`;
    });

    return `<div class="max-w-4xl mx-auto py-10">${html}</div>`;
  },
};
