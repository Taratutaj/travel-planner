import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";
import { getLocaleId, injectTravelpayoutsWidget } from "./cityData.js";

// --- FUNKCJA 1: (Autocomplete Google Maps) ---

let autocomplete;
let isPlaceSelected = false;

const btnSpan = document.querySelector('a[class*="submitBtn"] span');
if (btnSpan) {
    btnSpan.innerText = 'generuj plan';
}

function initAutocomplete() {
  const input = document.getElementById("destination");
  if (!input) return;

  const options = {
    types: ["(regions)"],
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);

  // Główne zdarzenie wyboru miejsca z listy
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    // Sprawdzamy, czy obiekt place ma geometrię (czyli czy istnieje w bazie Google)
    if (place && place.geometry) {
      isPlaceSelected = true;
      input.classList.remove("border-red-500", "ring-2", "ring-red-500");
    } else {
      isPlaceSelected = false;
    }
  });

  // KLUCZOWE: Resetowanie wyboru przy jakiejkolwiek ręcznej zmianie tekstu
  input.addEventListener("input", () => {
    isPlaceSelected = false;
    input.classList.remove("border-red-500", "ring-2", "ring-red-500");
  });

  // FIX DLA IPADA/MOBILE:
  // Zdarzenie 'touchend' na kontenerze podpowiedzi wymusza wybór na systemach iOS
  setTimeout(() => {
    const containers = document.getElementsByClassName("pac-container");
    for (let container of containers) {
      container.addEventListener("touchend", (e) => {
        // Pozwala to na poprawną reakcję Google Maps na dotyk
        e.stopImmediatePropagation();
      });
    }
  }, 1000);
}

// --- FUNKCJA 2: Sprawdzanie czy otwarto udostępniony plan ---
async function checkSharedPlan() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("id");

  if (planId) {
    UI.showLoading(); // Pokazujemy ładowanie przy pobieraniu linku
    try {
      const response = await fetch(`/api/get_plan/${planId}`);
      if (!response.ok) throw new Error("Nie znaleziono planu.");

      const data = await response.json();
      UI.elements.result.innerHTML = UI.renderTimeline(data.plan_data.plan);
      createShareButton(planId);
      const cityName = data.plan.days[0].location_en;
      const localeId = getLocaleId(cityName);
      injectTravelpayoutsWidget("travelpayouts-container", localeId);  
        
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
  const oldBtn = document.getElementById("share-plan-btn");
  if (oldBtn) oldBtn.remove();

  const shareBtn = document.createElement("button");
  shareBtn.id = "share-plan-btn";
  shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`;
  shareBtn.className =
    "fixed bottom-8 right-8 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 flex items-center gap-2 font-bold";

  shareBtn.onclick = () => {
    navigator.clipboard.writeText(shareUrl);
    shareBtn.innerText = "✅ Skopiowano!";
    setTimeout(() => {
      shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`;
    }, 2000);
  };

  document.body.appendChild(shareBtn);
}

// --- OBSŁUGA FORMULARZA (SUBMIT) ---
UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = UI.elements.destinationInput;

  // WALIDACJA: Jeśli użytkownik wpisał coś ręcznie (np. "Nibylandia") i nie wybrał z listy
  if (!isPlaceSelected) {
    input.focus();
    // Dodanie czerwonej obwódki i prosta animacja błędu
    input.classList.add("border-red-500", "ring-2", "ring-red-500");
    alert(
      "Proszę wybrać miejsce z listy podpowiedzi, która się pojawi podczas wpisywania."
    );
    return;
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);

      // --- NOWA LOGIKA WIDGETU ---
    // Pobieramy nazwę miasta z pierwszego dnia planu (location_en)
    const cityName = data.plan.days[0].location_en; 
    const localeId = getLocaleId(cityName);
    injectTravelpayoutsWidget("travelpayouts-container", localeId);

    if (data.id) {
      const newUrl = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
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
  // Sprawdzamy czy Google Maps zostało załadowane
  if (typeof google !== "undefined") {
    initAutocomplete();
  } else {
    console.error("Błąd: Biblioteka Google Maps nie została załadowana.");
  }
  checkSharedPlan();
});
