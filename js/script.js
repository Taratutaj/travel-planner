import { UI } from "./ui.js";
import { fetchTripPlan } from "./api.js";

// --- FUNKCJA 1: USUNIĘTA (Autocomplete Google Maps) ---

// --- FUNKCJA 2: Sprawdzanie czy otwarto udostępniony plan ---
async function checkSharedPlan() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("id");

  if (planId) {
    try {
      const response = await fetch(`/api/get_plan/${planId}`);
      if (!response.ok) throw new Error("Nie znaleziono planu.");

      const data = await response.json();
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
  const destination = input.value;
  const days = UI.elements.daysInput.value;

  // Logika sprawdzania isPlaceSelected została usunięta.
  // Przeglądarka sprawdzi tylko, czy pole nie jest puste (jeśli dodasz 'required' w HTML).

  UI.showLoading();

  try {
    const data = await fetchTripPlan(destination, days);
    UI.elements.result.innerHTML = UI.renderTimeline(data.plan);

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
  // initAutocomplete() - USUNIĘTO
  checkSharedPlan();
});
