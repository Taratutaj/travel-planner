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

  // ui.js -> renderTimeline
  // ui.js -> zmodyfikowana funkcja renderTimeline
  renderTimeline(planData) {
    if (!planData || !planData.days) {
      return '<p class="text-center text-white/50 p-10">Błąd danych planu.</p>';
    }

    const daysHtml = planData.days
      .map((day, index) => {
        const sectionId = `day-${day.day_number}`;
        const isFirstDay = index === 0;

        // Generujemy HTML dla danej sekcji dnia
        let daySectionHtml = `
      <section id="${sectionId}" 
               class="glass-card w-full mb-10 scroll-mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left"
               style="display: block; width: 100%;">
        
        ${
          isFirstDay
            ? `
          <h2 class="text-3xl md:text-4xl font-black mb-12 text-center text-white uppercase tracking-tighter leading-tight">
            ${planData.itinerary_title}
          </h2>
        `
            : ""
        }

        <div class="flex items-center mb-8">
          <div class="bg-green-500 text-black font-black px-4 py-1.5 rounded-full text-xs mr-4 uppercase tracking-widest flex-shrink-0">
            Dzień ${day.day_number}
          </div>
          <h3 class="text-2xl font-bold text-white tracking-tight">${day.location}</h3>
        </div>

        <div class="mb-10 w-full h-80 bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative group shadow-2xl">
          <img src="${day.imageUrl}" 
               alt="${day.location}"
               referrerpolicy="no-referrer"
               loading="lazy"
               class="w-full h-full object-cover opacity-0 transition-all duration-1000 group-hover:scale-105" 
               onload="this.style.opacity='1'" />
          
          <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/70 border border-white/10">
            Foto: <a href="${day.photoAuthorLink}" target="_blank" class="underline hover:text-green-400">
              ${day.photoAuthor}
            </a>
          </div>
        </div>

        <div class="relative ml-4 border-l-2 border-white/10 pl-8 space-y-12">
          ${day.activities
            .map(
              (act) => `
            <div class="timeline-item relative">
              <div class="absolute -left-[41px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="col-span-1">
                  <div class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">${act.period}</div>
                  <div class="text-sm font-mono text-white/50">${act.time_range}</div>
                </div>
                <div class="col-span-3 text-gray-200 leading-relaxed text-base md:text-lg italic-markdown">
                  ${marked.parse(act.description)}
                  ${act.maps_url ? `<a href="${act.maps_url}" target="_blank" class="inline-flex items-center gap-1 mt-3 text-sm text-green-400 hover:text-green-300">📍 Zobacz na mapie</a>` : ""}
                </div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </section>
      `;

        // KLUCZOWA ZMIANA: Po Dniu 1 dodajemy osobną sekcję z widgetem
        if (isFirstDay) {
          daySectionHtml += `
          <section class="glass-card w-full mb-10 p-8 text-center">
            <h3 class="text-white/70 text-sm uppercase tracking-widest mb-4">Zobacz również</h3>
            <div id="travelpayouts-container" class="w-full min-h-[200px]"></div>
          </section>
        `;
        }

        return daySectionHtml;
      })
      .join("");

    const shareButtonHtml = `
    <div id="share-button-container" class="flex justify-center mt-4 mb-12 w-full"></div>
  `;

    return daysHtml + shareButtonHtml;
  },
};
