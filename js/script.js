import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";

let isPlaceSelected = false;

// --- FUNKCJA 1: Inicjalizacja Autocomplete ---
function initAutocomplete() {
  const input = UI.elements.destinationInput;
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["(regions)"],
  });

  input.addEventListener("input", () => {
    isPlaceSelected = false;
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place?.geometry) {
      isPlaceSelected = true;
      input.value = place.formatted_address || place.name;
    }
  });
}

// --- FUNKCJA 2: Sprawdzanie czy otwarto udostępniony plan ---
async function checkSharedPlan() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('id');

  if (planId) {
   // UI.showLoading();
  
    try {
      const response = await fetch(`/api/get_plan/${planId}`);
      if (!response.ok) throw new Error("Nie znaleziono planu.");
      
      const data = await response.json();
      
      // Renderujemy plan z bazy (plan_data zawiera 'plan' i 'sources')
      UI.elements.result.innerHTML = UI.renderTimeline(data.plan_data.plan);
      
      createShareButton(planId);

    } catch (error) {
      console.error("Błąd pobierania planu:", error);
      UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center">Nie udało się wczytać planu.</div>`;
    } finally {
      UI.hideLoading();
    }
  }
}

// --- FUNKCJA 3: Obsługa przycisku kopiowania linku ---
function createShareButton(planId) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${planId}`;
  
  // Usuwamy stary przycisk jeśli istnieje
  const oldBtn = document.getElementById('share-plan-btn');
  if (oldBtn) oldBtn.remove();

  const shareBtn = document.createElement('button');
  shareBtn.id = 'share-plan-btn';
  shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`;
  shareBtn.className = "fixed bottom-8 right-8 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 flex items-center gap-2 font-bold";
  
  shareBtn.onclick = () => {
    navigator.clipboard.writeText(shareUrl);
    shareBtn.innerText = "✅ Skopiowano!";
    setTimeout(() => { shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`; }, 2000);
  };

  document.body.appendChild(shareBtn);
}

// --- OBSŁUGA FORMULARZA (SUBMIT) ---
UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = UI.elements.destinationInput;

  if (!isPlaceSelected) {
    input.setCustomValidity("Wybierz miasto z listy");
    input.reportValidity();
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    return;
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    
    // 1. Renderujemy plan
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);
    
    // 2. Jeśli backend zwrócił ID, tworzymy przycisk udostępniania i AKTUALIZUJEMY PASEK ADRESU
    if (data.id) {
      const newUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
    
    // Ta linia zmienia link w przeglądarce bez przeładowania strony!
      window.history.pushState({ path: newUrl }, '', newUrl);
    
    // Tworzymy przycisk do kopiowania linku
      createShareButton(data.id);
    }

  } catch (error) {
    console.error("Błąd podczas generowania planu:", error);
    UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center font-bold uppercase tracking-widest">${error.message}</div>`;
  } finally {
    UI.hideLoading();
    if (UI.elements.result) {
      UI.elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});

// --- START APLIKACJI ---
document.addEventListener("DOMContentLoaded", () => {
  initAutocomplete();
  checkSharedPlan(); // Sprawdzamy czy w URL jest ?id=
});
