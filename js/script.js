import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";

let isPlaceSelected = false;

// Inicjalizacja Google Autocomplete
function initAutocomplete() {
  const input = UI.elements.destinationInput;
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

// Obsługa wysyłania formularza
UI.elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isPlaceSelected) {
    UI.elements.destinationInput.focus();
    return;
  }

  const destination = UI.elements.destinationInput.value;
  const days = UI.elements.daysInput.value;

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);
  } catch (error) {
    console.error("Błąd podczas generowania planu:", error);
    UI.elements.result.innerHTML = `
      <div class="text-red-400 p-10 text-center font-bold uppercase tracking-widest">
        ${error.message}
      </div>`;
  } finally {
    UI.hideLoading();
  }
});

document.addEventListener("DOMContentLoaded", initAutocomplete);
