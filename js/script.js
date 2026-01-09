import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";

let isPlaceSelected = false;

// Inicjalizacja Google Autocomplete
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

UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const input = UI.elements.destinationInput;

  if (!isPlaceSelected) {
    // 1. Ustawiamy treść błędu (systemowy dymek)
    input.setCustomValidity("Wybierz miasto z listy");

    // 2. Pokazujemy dymek użytkownikowi
    input.reportValidity();

    // 3. Czyścimy błąd, gdy tylko użytkownik zacznie znowu pisać
    input.addEventListener("input", () => input.setCustomValidity(""), {
      once: true,
    });

    return;
  }

  const destination = input.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);
  } catch (error) {
    console.error("Błąd podczas generowania planu:", error);
    UI.elements.result.innerHTML = `<div class="text-red-400 p-10 text-center font-bold uppercase tracking-widest">${error.message}</div>`;
  } finally {
    UI.hideLoading();
    if (UI.elements.result) {
      UI.elements.result.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", initAutocomplete);
