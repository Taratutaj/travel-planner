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

    if (!el.modal || !el.progress) {
      console.error("Błąd: Nie znaleziono elementów modala w HTML.");
      return;
    }

    el.progress.style.transition = "none";
    el.progress.style.width = "0%";
    el.progress.offsetHeight;

    el.progress.style.transition = "width 10s ease-out";

    if (el.fact && travelFacts && travelFacts.length > 0) {
      el.fact.textContent =
        travelFacts[Math.floor(Math.random() * travelFacts.length)];
    }

    el.modal.classList.remove("hidden");
    el.modal.style.display = "flex";

    if (el.submitBtn) el.submitBtn.disabled = true;

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

  renderTravelTips(tips) {
    if (!tips) return "";

    let html = `
    <div class="mt-12 mb-8">
      <h2 class="text-3xl font-black text-white text-center mb-10 uppercase tracking-tighter">
        Praktyczne informacje
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-card p-6 border-l-4 border-green-500">
          <h3 class="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <i class="fas fa-passport"></i> Zanim wyruszysz
          </h3>
          <div class="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p><strong>Wiza i dokumenty:</strong> ${tips.before_you_go.visa_docs}</p>
            <p><strong>Zdrowie:</strong> ${tips.before_you_go.health}</p>
            <p><strong>Co zabrać:</strong> ${tips.before_you_go.essentials}</p>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-blue-500">
          <h3 class="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <i class="fas fa-bus"></i> Transport
          </h3>
          <div class="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p><strong>Z lotniska:</strong> ${tips.transport.airport_transfer}</p>
            <p><strong>Lokalnie:</strong> ${tips.transport.local_transport}</p>
            <p><strong>Wynajem:</strong> ${tips.transport.rental_info}</p>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-yellow-500">
          <h3 class="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <i class="fas fa-wallet"></i> Finanse
          </h3>
          <div class="space-y-3 text-gray-200 text-sm leading-relaxed">
            <p><strong>Płatności:</strong> ${tips.finances.currency_payments}</p>
            <div class="bg-white/5 p-3 rounded-lg">
              <span class="text-[10px] uppercase font-bold text-yellow-500 block mb-1">Przykładowe ceny:</span>
              <ul class="list-disc ml-4 text-xs space-y-1">
                ${tips.finances.example_prices.map((price) => `<li>${price}</li>`).join("")}
              </ul>
            </div>
            <p><strong>Napiwki:</strong> ${tips.finances.tipping_culture}</p>
          </div>
        </div>

        <div class="glass-card p-6 border-l-4 border-red-500">
          <h3 class="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <i class="fas fa-shield-alt"></i> Kultura i Bezpieczeństwo
          </h3>
          <div class="space-y-4 text-gray-200 text-sm leading-relaxed">
            <p><strong>Zwroty:</strong> <span class="italic text-white font-medium">${tips.culture_safety.phrases}</span></p>
            <p><strong>Etykieta:</strong> ${tips.culture_safety.etiquette}</p>
            <p><strong>Bezpieczeństwo:</strong> ${tips.culture_safety.safety_scams}</p>
          </div>
        </div>
      </div>
    </div>
    `;

    // DODANO TUTAJ: Widget noclegów na samym końcu praktycznych informacji
    html += `
    <section class="glass-card w-full mt-10 p-8 text-center">
      <h3 class="text-white/70 text-sm uppercase tracking-widest mb-4">Rezerwuj, póki są dostępne</h3>
      <h4 class="text-white/50 text-s mb-6">Najpopularniejsze atrakcje w tym mieście wyprzedają się z wyprzedzeniem. Zabezpiecz swój termin już teraz.</h4>
      <div id="travelpayouts-container" class="w-full min-h-[200px]"></div>
    </section>
    `;

    return html;
  },

  renderTimeline(planData) {
    if (!planData || !planData.days) {
      return '<p class="text-center text-white/50 p-10">Błąd danych planu.</p>';
    }

    const daysHtml = planData.days
      .map((day, index) => {
        const sectionId = `day-${day.day_number}`;
        const isFirstDay = index === 0;

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

        // Atrakcje GYG zostają pod Dniem 1
        if (isFirstDay) {
          daySectionHtml += `
          <section class="glass-card w-full mb-10 p-8 text-center">
            <h3 class="text-white/70 text-sm uppercase tracking-widest mb-4">Polecane atrakcje</h3>
            <h4 class="text-white/50 text-s mb-6">Zarezerwuj bilety online i nie trać ani minuty na stanie w kasach.</h4>
            <div id="gyg-container" class="w-full min-h-[200px]"></div>
          </section>
          `;
        }

        return daySectionHtml;
      })
      .join("");

    return (
      daysHtml +
      `<div id="share-button-container" class="flex justify-center mt-4 mb-12 w-full"></div>`
    );
  },
};
