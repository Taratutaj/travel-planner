// --- KONFIGURACJA I IMPORTY ---
import { travelFacts } from "./travelFacts.js";
import { mockData } from "./mockData.js";

const UNSPLASH_ACCESS_KEY = "SunTiLUHG4qbh9lTJmP-hOw3lJOdGjRu9jA3iEsLQfo";
let isPlaceSelected = false; 

// --- KONFIGURACJA MARKED ---
const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:underline">${text}</a>`;
};
marked.use({ renderer });

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

// --- LOGIKA UI ---
const UI = {
  showLoading() {
    DOM.fact.textContent = travelFacts[Math.floor(Math.random() * travelFacts.length)];
    DOM.modal.style.display = "flex";
    DOM.submitBtn.disabled = true;
    DOM.progress.style.width = "85%";
  },
  hideLoading() {
    DOM.progress.style.width = "100%";
    setTimeout(() => { 
      DOM.modal.style.display = "none"; 
      DOM.submitBtn.disabled = false; 
    }, 300);
  },
  renderTimeline(planData) {
    let html = `<h2 class="text-3xl font-black mb-12 text-center text-white uppercase tracking-tighter">${planData.itinerary_title}</h2>`;
    
    planData.days.forEach(day => {
      html += `
        <div class="day-wrapper mb-16 text-left">
          <div class="flex items-center mb-6">
            <div class="bg-green-500 text-black font-black px-4 py-1 rounded-full text-sm mr-4 uppercase">Dzień ${day.day_number}</div>
            <h3 class="text-2xl font-bold text-white">${day.location}</h3>
          </div>
          <div class="mb-10 w-full h-80 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl">
            <img src="${day.imageUrl}" class="w-full h-full object-cover transition-opacity duration-700" onload="this.style.opacity=1" style="opacity: 0;" />
            <div class="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/80">
              Foto: <a href="${day.photoAuthorLink}" target="_blank" class="underline hover:text-white">${day.photoAuthor}</a>
            </div>
          </div>
          <div class="relative ml-6 border-l-2 border-white/10 pl-10 space-y-12">
            ${day.activities.map(act => `
              <div class="timeline-item relative">
                <div class="absolute -left-[49px] top-1.5 w-4 h-4 bg-white rounded-full border-4 border-gray-900 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div class="col-span-1">
                    <div class="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">${act.period}</div>
                    <div class="text-sm font-mono text-white/60">${act.time_range}</div>
                  </div>
                  <div class="col-span-3 text-gray-200 leading-relaxed text-lg italic-markdown">
                    ${marked.parse(act.description)}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    });
    return html;
  }
};

// --- POBIERANIE ZDJĘĆ ---
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

// --- HANDLER FORMULARZA ---
DOM.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isPlaceSelected) {
    DOM.destinationInput.focus();
    return;
  }

  const destination = DOM.destinationInput.value;
  const days = DOM.daysInput.value;

  UI.showLoading();
  DOM.result.innerHTML = '<div class="py-20 text-center animate-pulse text-white/50 text-xl tracking-widest uppercase italic">Generowanie Twojej przygody...</div>';

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

    // Pobieranie zdjęć równolegle
    await Promise.all(
      planData.days.map(async (day) => {
        const finalQuery = `${day.location_en} ${countryTag}`.trim();
        const photoData = await getUnsplashPhoto(finalQuery);
        day.imageUrl = photoData.url;
        day.photoAuthor = photoData.user;
        day.photoAuthorLink = photoData.userLink;
      })
    );

    DOM.result.innerHTML = `<div class="max-w-4xl mx-auto py-10">${UI.renderTimeline(planData)}</div>`;
  } catch (error) {
    console.error(error);
    DOM.result.innerHTML = `<div class="text-red-400 p-10 text-center font-bold uppercase tracking-widest">${error.message}</div>`;
  } finally {
    UI.hideLoading();
  }
});

// --- GOOGLE AUTOCOMPLETE ---
function initAutocomplete() {
  const input = DOM.destinationInput;
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

document.addEventListener("DOMContentLoaded", initAutocomplete);
