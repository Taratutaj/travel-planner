// --- 1. KONFIGURACJA BIBLIOTEKI MARKED ---
const renderer = new marked.Renderer();

// Nadpisujemy funkcję renderowania linków
renderer.link = function(href, title, text) {
    return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// Ustawiamy opcje raz, a porządnie
marked.setOptions({
    renderer: renderer, // Przekazujemy nasz renderer tutaj
    breaks: true,
    gfm: true,
});

// --- 2. LISTA CIEKAWOSTEK ---
const travelFacts = [
  "Ciekawostka: Wielki Mur Chiński jest tak długi, że można nim okrążyć Ziemię 6 razy!",
  "Ciekawostka: Najkrótszy lot na świecie trwa tylko 2 minuty – między szkockimi wyspami Westray i Papa Westray.",
  "Ciekawostka: Pustynia Sahara była kiedyś zieloną sawanną, pełną zwierząt i rzek.",
  "Ciekawostka: Na Malcie znajduje się więcej zabytkowych budowli na metr kwadratowy niż gdziekolwiek indziej na świecie.",
  "Ciekawostka: W Wenecji jest około 400 mostów, ale tylko jeden z nich ma nazwę 'Most Westchnień'.",
  "Ciekawostka: Australia jest szersza niż Księżyc. Księżyc ma 3400 km średnicy, Australia ma 4000 km.",
  "Ciekawostka: Najwyższy wodospad na świecie, Salto Angel w Wenezueli, jest blisko 15 razy wyższy niż wodospad Niagara.",
  "Ciekawostka: Rosja obejmuje 11 stref czasowych – to najwięcej na świecie!",
];

// --- 3. FUNKCJE OBSŁUGI MODALA ŁADOWANIA ---
function showLoadingModal() {
  const modal = document.getElementById("loadingModal");
  const factElement = document.getElementById("travelFact");
  const progressBar = document.getElementById("progressBarFill");

  if (!modal || !factElement || !progressBar) return;

  const randomFact = travelFacts[Math.floor(Math.random() * travelFacts.length)];
  factElement.textContent = randomFact;

  modal.style.display = "flex";
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  void progressBar.offsetWidth;
  progressBar.style.transition = "width 10s ease-out";
  progressBar.style.width = "85%";
}

function hideLoadingModal() {
  const modal = document.getElementById("loadingModal");
  const progressBar = document.getElementById("progressBarFill");
  if (!modal || !progressBar) return;

  progressBar.style.transition = "width 0.3s ease-in";
  progressBar.style.width = "100%";
  setTimeout(() => { modal.style.display = "none"; }, 300);
}

// --- 4. GŁÓWNA LOGIKA APLIKACJI (FETCH) ---
document.getElementById("planForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const destination = document.getElementById("destination").value;
  const days = document.getElementById("days").value;
  const resultDiv = document.getElementById("result");
  const submitButton = document.getElementById("submitButton");

  showLoadingModal();
  submitButton.disabled = true;

  try {
    resultDiv.innerHTML = '<p class="text-lg text-center opacity-80">Generowanie planu...</p>';

    const response = await fetch("/generate_plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination: destination,
        days: parseInt(days),
      }),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textError = await response.text();
      throw new Error(`Serwer nie zwrócił JSON. Status: ${response.status}`);
    }

    if (response.ok) {
      const planContent = data.plan; 
      const sources = data.sources || [];

      // 1. Generujemy HTML (standardowo)
      const htmlContent = marked.parse(planContent);
      
      let sourcesHtml = "";
      if (sources.length > 0) {
        sourcesHtml += '<div class="sources-container mt-6 p-4 bg-white/10 rounded-lg">';
        sourcesHtml += '<h4 class="text-sm font-semibold mb-2 text-white">Źródła (Google Search):</h4>';
        sourcesHtml += '<ul class="list-disc list-inside space-y-1 text-sm opacity-80">';

        const uniqueSources = new Map();
        sources.forEach((source) => {
          if (source.uri) uniqueSources.set(source.uri, source.title || source.uri);
        });

        uniqueSources.forEach((title, uri) => {
          // Tutaj target="_blank" jest wpisany "z palca", więc musi działać
          sourcesHtml += `<li><a href="${uri}" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:underline">${title}</a></li>`;
        });
        sourcesHtml += "</ul></div>";
      }

      // 2. Wstawiamy treść do kontenera
      resultDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-white">${destination} (${days} dni)</h2>
        <div id="plan-text" class="prose prose-invert max-w-none">${htmlContent}</div>
        ${sourcesHtml}
      `;

      // 3. --- KLUCZOWA POPRAWKA (PEWNY SPOSÓB) ---
      // Szukamy wszystkich linków wewnątrz właśnie wstawionego planu
      const planLinks = document.querySelectorAll('#plan-text a');
      planLinks.forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
      });

    } else {
      resultDiv.innerHTML = `<h2 class="text-red-400">Błąd:</h2><p>${data.error || "Błąd serwera"}</p>`;
    }
  } catch (error) {
    console.error("Błąd komunikacji:",
