import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";
import { getLocaleId, injectTravelpayoutsWidget } from "./cityData.js";

// --- FUNKCJA POMOCNICZA: Generuj nowy plan (Przycisk na dole) ---

function addGenerateNewPlanButton() {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

// --- FUNKCJA POMOCNICZA: Wstrzykiwanie widgetu GYG ---
function injectGYGWidget(destination) {
  const gygContainer = document.getElementById("gyg-container");
  if (!gygContainer) return;

  gygContainer.innerHTML = `
      <div data-gyg-href="https://widget.getyourguide.com/default/activities.frame" 
           data-gyg-locale-code="pl-PL" 
           data-gyg-widget="activities" 
           data-gyg-number-of-items="3" 
           data-gyg-partner-id="6QOAHMH" 
           data-gyg-q="${destination}">
      </div>
    `;

  const script = document.createElement("script");
  script.src = "https://widget.getyourguide.com/dist/pa.umd.production.min.js";
  script.async = true;
  document.body.appendChild(script);
}

// --- FUNKCJA 1: (Autocomplete Google Maps) ---

let autocomplete;
let isPlaceSelected = false;

function initAutocomplete() {
  const input = document.getElementById("destination");
  if (!input) return;

  const options = { types: ["(regions)"] };
  autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    // Sprawdzamy czy miejsce ma geometrię (czyli czy jest poprawne)
    isPlaceSelected = !!(place && place.geometry);
    if (isPlaceSelected)
      input.classList.remove("border-red-500", "ring-2", "ring-red-500");
  });

  // DODAJEMY TO: Obsługa klawisza Enter, aby nie wysyłał formularza przedwcześnie
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.querySelector(".pac-item-selected")) {
      // Jeśli użytkownik nawiguje strzałkami po liście, pozwól Google Maps to obsłużyć
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault(); // Zapobiegamy wysyłce, póki nie spróbujemy auto-selectu
    }
  });

  input.addEventListener("input", () => {
    isPlaceSelected = false;
    input.classList.remove("border-red-500", "ring-2", "ring-red-500");
  });
}

// --- FUNKCJA 2: Sprawdzanie czy otwarto udostępniony plan ---
async function checkSharedPlan() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("id");

  if (planId) {
    UI.showLoading();
    try {
      const res = await fetch(`/api/plan/${planId}`);
      const data = await res.json();

      if (data.plan) {
        let finalHtml = UI.renderTimeline(data.plan);
        if (data.plan.travel_tips) {
          finalHtml += UI.renderTravelTips(data.plan.travel_tips);
        }
        UI.elements.result.innerHTML = finalHtml;

        if (data.plan.days && data.plan.days.length > 0) {
          const cityNameEn = data.plan.days[0].location_en;
          const countryNameEn = data.plan.country_en;
          // NAPRAWA: Pobranie nazwy miasta z planu, bo zmienna 'destination' tu nie istnieje
          const destinationLabel = data.plan.days[0].location || cityNameEn;

          injectGYGWidget(destinationLabel);

          const localeId = getLocaleId(cityNameEn, countryNameEn);
          injectTravelpayoutsWidget("travelpayouts-container", localeId);
        }
        addGenerateNewPlanButton();
        createShareButton(planId);
      }
    } catch (err) {
      console.error("Błąd ładowania planu:", err);
      UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center uppercase">Nie udało się wczytać planu.</div>`;
    } finally {
      UI.hideLoading();
    }
  }
}

// --- FUNKCJA 3: Obsługa przycisku kopiowania linku ---
function createShareButton(planId) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?id=${planId}`;
  let shareBtn = document.getElementById("share-plan-btn");

  if (!shareBtn) {
    shareBtn = document.createElement("button");
    shareBtn.id = "share-plan-btn";
    shareBtn.className =
      "fixed bottom-8 right-8 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 z-50 flex items-center gap-2 font-bold";
    document.body.appendChild(shareBtn);
  }

  shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`;
  shareBtn.onclick = () => {
    navigator.clipboard.writeText(shareUrl);
    shareBtn.innerText = "✅ Skopiowano!";
    setTimeout(() => {
      shareBtn.innerHTML = `<span>🔗 Kopiuj link do planu</span>`;
    }, 2000);
  };
}

// --- OBSŁUGA FORMULARZA (SUBMIT) ---
UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = UI.elements.destinationInput;

  // --- LOGIKA AUTO-SELECT ---
  if (!isPlaceSelected && input.value.trim() !== "") {
    // Symulujemy naciśnięcie strzałki w dół i Entera, aby Google wybrało pierwszą opcję
    // lub sprawdzamy czy usługa Autocomplete ma coś w buforze.

    const googleService = new google.maps.places.AutocompleteService();
    const predictions = await new Promise((resolve) => {
      googleService.getPlacePredictions(
        { input: input.value, types: ["(regions)"] },
        resolve,
      );
    });

    if (predictions && predictions.length > 0) {
      // Mamy podpowiedzi! Pobieramy szczegóły pierwszej z nich
      const placesService = new google.maps.places.PlacesService(
        document.createElement("div"),
      );

      await new Promise((resolve) => {
        placesService.getDetails(
          { placeId: predictions[0].place_id },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              input.value = place.formatted_address;
              isPlaceSelected = true;
              // Opcjonalnie: wywołaj zdarzenie place_changed ręcznie lub kontynuuj
              resolve();
            }
          },
        );
      });
    }
  }

  // Finalna walidacja po próbie auto-selectu
  if (!isPlaceSelected) {
    input.focus();
    input.classList.add("border-red-500", "ring-2", "ring-red-500");
    alert("Proszę wpisać nazwę miejsca i wybrać jedną z podpowiedzi.");
    return;
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;
  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);

    // 1. Generujemy HTML
    let finalHtml = UI.renderTimeline(data.plan);
    if (data.plan.travel_tips) {
      finalHtml += UI.renderTravelTips(data.plan.travel_tips);
    }

    // 2. Wstawiamy HTML do DOM
    UI.elements.result.innerHTML = finalHtml;

    // 3. KLUCZOWE: Dajemy przeglądarce milisekundę na "przetrawienie" DOM przed szukaniem kontenerów
    setTimeout(() => {
      if (data.plan && data.plan.days && data.plan.days.length > 0) {
        // Atrakcje (używamy zmiennej destination z formularza)
        injectGYGWidget(destination);

        // Hotele (Travelpayouts)
        const cityName = data.plan.days[0].location_en;
        const countryName = data.plan.country_en;
        const localeId = getLocaleId(cityName, countryName);
        injectTravelpayoutsWidget("travelpayouts-container", localeId);
      }

      // Dodajemy przycisk na samym dole (musi być po wstawieniu widgetów)
      addGenerateNewPlanButton();
    }, 50);

    // 4. Obsługa URL i przycisku udostępniania
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
  }
  checkSharedPlan();
});
