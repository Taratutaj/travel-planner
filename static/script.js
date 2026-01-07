// --- KONFIGURACJA I IMPORTY ---
import { travelFacts } from "./travelFacts.js";
import { mockData } from "./mockData.js";

const UNSPLASH_ACCESS_KEY = "SunTiLUHG4qbh9lTJmP-hOw3lJOdGjRu9jA3iEsLQfo";
let isPlaceSelected = false; // Flaga nadal potrzebna do logiki, ale bez stylów wizualnych

// --- CACHE ELEMENTÓW DOM ---
const DOM = {
  form: document.getElementById("planForm"),
  result: document.getElementById("result"),
  submitBtn: document.getElementById("submitButton"),
  modal: document.getElementById("loadingModal"),
  fact: document.getElementById("travelFact"),
  progress: document.getElementById("progressBarFill"),
  destinationInput: document.getElementById("destination"),
  daysInput: document.getElementById("days"),
};

// --- GŁÓWNY HANDLER (USUNIĘTO STYLE DYNAMICZNE) ---
DOM.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Tylko prosta walidacja bez zmian w wyglądzie inputa
  if (!isPlaceSelected) {
    console.log("Blokada: Wybierz lokalizację z listy Google.");
    DOM.destinationInput.focus();
    return;
  }

  const destination = DOM.destinationInput.value;
  const days = DOM.daysInput.value;

  UI.showLoading();
  DOM.result.innerHTML = '<div class="py-20 text-center text-white/50 uppercase">Przygotowuję plan...</div>';

  try {
    const response = await fetch("/generate_plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, days: parseInt(days) }),
    });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Błąd serwera");

    const planData = data.plan;
    const countryTag = planData.country_en || "";

    await Promise.all(
      planData.days.map(async (day) => {
        const finalQuery = `${day.location_en} ${countryTag}`.trim();
        const photoData = await getUnsplashPhoto(finalQuery);
        day.imageUrl = photoData.url;
        day.photoAuthor = photoData.user;
        day.photoAuthorLink = photoData.userLink;
        day.usedQuery = finalQuery;
      })
    );

    DOM.result.innerHTML = `<div class="max-w-4xl mx-auto py-10">${UI.renderTimeline(planData)}</div>`;
  } catch (error) {
    DOM.result.innerHTML = `<div class="text-red-400 p-10 text-center">${error.message}</div>`;
  } finally {
    UI.hideLoading();
  }
});

// --- GOOGLE AUTOCOMPLETE (USUNIĘTO STYLE DYNAMICZNE) ---
function initAutocomplete() {
  const input = DOM.destinationInput;
  if (!input) return;

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["(regions)"],
  });

  input.addEventListener("input", () => {
    isPlaceSelected = false; // Po prostu resetujemy flagę, bez zmian CSS
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place?.geometry) {
      isPlaceSelected = true;
      input.value = place.formatted_address || place.name;
    }
  });
}

// Funkcja pobierania zdjęć i UI (showLoading/hideLoading/renderTimeline) pozostają bez zmian w logice, 
// ale bez wstrzykiwania klas błędów.

async function getUnsplashPhoto(query) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await response.json();
    const photo = data.results[0];
    return photo ? {
      url: photo.urls.regular,
      user: photo.user.name,
      userLink: photo.user.links.html,
    } : {
      url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
      user: "Unsplash",
      userLink: "https://unsplash.com",
    };
  } catch (error) {
    return { url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80", user: "Unsplash", userLink: "#" };
  }
}

const UI = {
  showLoading() {
    DOM.fact.textContent = travelFacts[Math.floor(Math.random() * travelFacts.length)];
    DOM.modal.style.display = "flex";
    DOM.submitBtn.disabled = true;
    DOM.progress.style.width = "85%";
  },
  hideLoading() {
    DOM.progress.style.width = "100%";
    setTimeout(() => { DOM.modal.style.display = "none"; DOM.submitBtn.disabled = false; }, 300);
  },
  renderTimeline(planData) {
    // Twoja standardowa funkcja renderująca HTML timeline'u
    return "Tu renderuje się plan..."; 
  }
};

document.addEventListener("DOMContentLoaded", initAutocomplete);
