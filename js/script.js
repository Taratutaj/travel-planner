import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";
import { getLocaleId, injectTravelpayoutsWidget } from "./cityData.js";

// --- FUNKCJA POMOCNICZA: Generuj nowy plan (Przycisk na dole) ---

function addGenerateNewPlanButton() {
  // Usuwamy stary przycisk jeśli istnieje
  const oldBtnContainer = document.getElementById("reset-btn-container");
  if (oldBtnContainer) oldBtnContainer.remove();

  const btnContainer = document.createElement("div");
  btnContainer.id = "reset-btn-container";
  btnContainer.className = "w-full flex justify-center mt-12 mb-10 pb-10";
  btnContainer.innerHTML = `
    <button class="group relative px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-green-400/30 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]">
        <div class="flex items-center gap-3">
            <span class="text-xl group-hover:scale-110 transition-transform duration-500">🔍</span>
            <span class="text-white/80 font-medium tracking-wide group-hover:text-green-400 transition-colors">Zaplanuj kolejną podróż</span>
        </div>
    </button>
  `;

  btnContainer.querySelector("button").onclick = () => {
    // Przewijamy na samą górę
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Opcjonalnie: focus na input po przewinięciu
    setTimeout(() => {
      const input = document.getElementById("destination");
      if (input) {
        input.value = "";
        input.focus();
      }
    }, 800);
  };

  UI.elements.result.appendChild(btnContainer);
}

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
          let finalHtml = UI.renderTimeline(data.plan);

          if (data.plan.travel_tips) {
            finalHtml += UI.renderTravelTips(data.plan.travel_tips);
          }

          UI.elements.result.innerHTML = finalHtml;

          if (data.plan.days && data.plan.days.length > 0) {
            const cityName = data.plan.days[0].location_en;
            const countryName = data.plan.country_en;

            const localeId = getLocaleId(cityName, countryName);
            injectTravelpayoutsWidget("travelpayouts-container", localeId);
          }
          // Dodajemy przycisk na dole
          addGenerateNewPlanButton();
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
    let finalHtml = UI.renderTimeline(data.plan);

    if (data.plan.travel_tips) {
      finalHtml += UI.renderTravelTips(data.plan.travel_tips);
    }

    UI.elements.result.innerHTML = finalHtml;

    if (data.plan && data.plan.days && data.plan.days.length > 0) {
      const cityName = data.plan.days[0].location_en;
      const countryName = data.plan.country_en;

      const localeId = getLocaleId(cityName, countryName);
      injectTravelpayoutsWidget("travelpayouts-container", localeId);
    }

    // Dodajemy przycisk na samym dole
    addGenerateNewPlanButton();

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
