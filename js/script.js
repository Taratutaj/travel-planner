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
  // FIX DLA IPADA: Zapobiega "ukrywaniu" listy przez system
  input.addEventListener('focus', () => {
      // Krótkie opóźnienie, aby klawiatura zdążyła się wysunąć
      setTimeout(() => {
          const container = document.querySelector('.pac-container');
          if (container) {
              container.style.zIndex = "10000";
          }
      }, 300);
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
    UI.showLoading(); // Odkomentowane, aby użytkownik wiedział, że coś się dzieje
    if (UI.elements.setupContainer) UI.elements.setupContainer.classList.add('hidden');

    try {
      const response = await fetch(`/api/get_plan/${planId}`);
      if (!response.ok) throw new Error("Nie znaleziono planu.");
      
      const data = await response.json();
      
      // Renderujemy plan
      UI.elements.result.innerHTML = UI.renderTimeline(data.plan_data.plan);
      
      // Dodajemy przycisk kopiowania (dla iPada/Mobile)
      createShareButton(planId);
      

    } catch (error) {
      console.error("Błąd pobierania planu:", error);
      UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center">Nie udało się wczytać planu.</div>`;
    } finally {
      UI.hideLoading();
    }
  }
}

// --- NOWA FUNKCJA: Przycisk na samym dole ---


  
  container.appendChild(btn);
  UI.elements.result.appendChild(container);
}

// --- FUNKCJA 3: Obsługa przycisku kopiowania linku ---
function createShareButton(planId) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${planId}`;
  const oldBtn = document.getElementById('share-plan-btn');
  if (oldBtn) oldBtn.remove();

  const shareBtn = document.createElement('button');
  shareBtn.id = 'share-plan-btn';
  shareBtn.innerHTML = `<span>🔗 Kopiuj link</span>`;
  // Z-index ustawiony wysoko dla iPada
  shareBtn.className = "fixed bottom-8 right-8 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 z-[9999] flex items-center gap-2 font-bold";
  
  shareBtn.onclick = () => {
    navigator.clipboard.writeText(shareUrl);
    shareBtn.innerText = "✅ Skopiowano!";
    setTimeout(() => { shareBtn.innerHTML = `<span>🔗 Kopiuj link</span>`; }, 2000);
  };

  document.body.appendChild(shareBtn);
}

// --- OBSŁUGA FORMULARZA (SUBMIT) ---
UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = UI.elements.destinationInput;

  // --- LOGIKA IPAD / AUTO-SELECT ---
  // Jeśli użytkownik nie wybrał z listy, wymuszamy pierwszy wynik od Google
  if (!isPlaceSelected) {
    const firstSuggestion = document.querySelector('.pac-item');
    if (firstSuggestion) {
      // Symulujemy klawisz w dół i Enter
      const downEvent = new KeyboardEvent('keydown', { keyCode: 40, which: 40 });
      const enterEvent = new KeyboardEvent('keydown', { keyCode: 13, which: 13 });
      input.dispatchEvent(downEvent);
      input.dispatchEvent(enterEvent);
      
      // Dajemy Google 200ms na zaktualizowanie inputa
      setTimeout(() => UI.elements.form.requestSubmit(), 200);
      return;
    } else {
      // Jeśli brak podpowiedzi, pokazujemy błąd
      input.setCustomValidity("Proszę wybrać miejsce z listy podpowiedzi.");
      input.reportValidity();
      return;
    }
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);
    
    if (data.id) {
      const newUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      createShareButton(data.id);
      addCreateOwnPlanButton(); // Przycisk pod nowo wygenerowanym planem
    }

  } catch (error) {
    console.error("Błąd:", error);
    UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center font-bold uppercase">${error.message}</div>`;
  } finally {
    UI.hideLoading();
    UI.elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// --- START APLIKACJI ---
document.addEventListener("DOMContentLoaded", () => {
  initAutocomplete();
  checkSharedPlan();
});
