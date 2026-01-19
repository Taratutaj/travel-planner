import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";
// DODANO: Import funkcji z cityData.js
import { getLocaleId, injectTravelpayoutsWidget } from "./cityData.js";

// --- FUNKCJA 1: (Autocomplete Google Maps) ---

let autocomplete;
let isPlaceSelected = false;

const btnSpan = document.querySelector('a[class*="submitBtn"] span');
if (btnSpan) {
  btnSpan.innerText = "generuj plan";
}

function initAutocomplete() {
  const input = document.getElementById("destination");
  if (!input) return;

  const options = {
    types: ["(regions)"],
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place && place.geometry) {
      isPlaceSelected = true;
      input.classList.remove("border-red-500", "ring-2", "ring-red-500");
    } else {
      isPlaceSelected = false;
    }
  });

  input.addEventListener("input", () => {
    isPlaceSelected = false;
    input.classList.remove("border-red-500", "ring-2", "ring-red-500");
  });

  setTimeout(() => {
    const containers = document.getElementsByClassName("pac-container");
    for (let container of containers) {
      container.addEventListener("touchend", (e) => {
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
    UI.showLoading();
    fetch(`/api/plan/${planId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) {
          // 1. Renderujemy oś czasu
          let finalHtml = UI.renderTimeline(data.plan);

          // 2. DODANO: Renderujemy sekcję porad, jeśli istnieje w zapisanym planie
          if (data.plan.travel_tips) {
            finalHtml += UI.renderTravelTips(data.plan.travel_tips);
          }

          UI.elements.result.innerHTML = finalHtml;

          const carLocale = getCarsLocale(cityName, countryName);
          injectCarsWidget("cars-widget-container", carLocale);

          // 3. Obsługa widgetu Travelpayouts dla wczytanego planu
          if (data.plan.days && data.plan.days.length > 0) {
            const cityName = data.plan.days[0].location_en;
            const countryName = data.plan.country_en;
            const localeId = getLocaleId(cityName, countryName);
            injectTravelpayoutsWidget("travelpayouts-container", localeId);
          }
        }
      })
      .catch((err) => {
        console.error("Błąd ładowania planu:", err);
        UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center uppercase">Nie udało się wczytać planu.</div>`;
      })
      .finally(() => {
        UI.hideLoading();
      });
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

  if (!isPlaceSelected) {
    input.focus();
    input.classList.add("border-red-500", "ring-2", "ring-red-500");
    alert("Proszę wybrać miejsce z listy podpowiedzi.");
    return;
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    // Renderujemy oś czasu (dni)
    let finalHtml = UI.renderTimeline(data.plan);

    // DODANO: Jeśli AI zwróciło travel_tips, doklejamy je pod planem dni
    if (data.plan.travel_tips) {
      finalHtml += UI.renderTravelTips(data.plan.travel_tips);
    }

    UI.elements.result.innerHTML = finalHtml;

    // DODANO: Wyświetlanie widgetu po wygenerowaniu nowego planu
    if (data.plan && data.plan.days && data.plan.days.length > 0) {
      const cityName = data.plan.days[0].location_en;
      const countryName = data.plan.country_en; // Gemini zwraca to teraz dzięki RESPONSE_SCHEMA
      const localeId = getLocaleId(cityName, countryName);
      injectTravelpayoutsWidget("travelpayouts-container", localeId);
    }
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
  if (typeof google !== "undefined") {
    initAutocomplete();
  } else {
    console.error("Błąd: Biblioteka Google Maps nie została załadowana.");
  }
  checkSharedPlan();
});
