// 1. Konfiguracja biblioteki marked (najprostsza możliwa)
marked.setOptions({
  breaks: true,
  gfm: true,
});

// --- LISTA CIEKAWOSTEK ---
const travelFacts = [
  "Ciekawostka: Wielki Mur Chiński jest tak długi, że można nim okrążyć Ziemię 6 razy!",
  "Ciekawostka: Najkrótszy lot na świecie trwa tylko 2 minuty – między szkockimi wyspami Westray i Papa Westray.",
  "Ciekawostka: Pustynia Sahara była kiedyś zieloną sawanną, pełną zwierząt i rzek.",
  "Ciekawostka: Na Malcie znajduje się więcej zabytkowych budowli na metr kwadratowy niż gdziekolwiek indziej na świecie.",
  "Ciekawostka: W Wenecji jest około 400 mostów, ale tylko jeden z nich ma nazwę 'Most Westchnień'.",
  "Ciekawostka: Australia jest szersza niż Księżyc.",
  "Ciekawostka: Najwyższy wodospad na świecie, Salto Angel w Wenezueli, jest blisko 15 razy wyższy niż Niagara.",
  "Ciekawostka: Rosja obejmuje 11 stref czasowych – to najwięcej na świecie!",
];

// --- FUNKCJE OBSŁUGI MODALA ---
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

// --- GŁÓWNA LOGIKA (FETCH) ---
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

    const data = await response.json();

    if (response.ok) {
      // Zamieniamy Markdown na HTML
      const htmlContent = marked.parse(data.plan); 
      
      let sourcesHtml = "";
      if (data.sources && data.sources.length > 0) {
        sourcesHtml += '<div class="sources-container mt-6 p-4 bg-white/10 rounded-lg"><h4 class="text-sm font-semibold mb-2 text-white">Źródła:</h4><ul class="list-disc list-inside text-sm opacity-80">';
        
        const uniqueSources = new Map();
        data.sources.forEach(s => { if(s.uri) uniqueSources.set(s.uri, s.title || s.uri); });
        uniqueSources.forEach((title, uri) => {
          sourcesHtml += `<li><a href="${uri}" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:underline">${title}</a></li>`;
        });
        sourcesHtml += "</ul></div>";
      }

      // Wstawiamy wynik do HTML
      resultDiv.innerHTML = `
        <h2 class="text-2xl font-bold mb-4 text-white">${destination} (${days} dni)</h2>
        <div id="plan-body" class="prose prose-invert max-w-none">${htmlContent}</div>
        ${sourcesHtml}
      `;

      // WYMUSZENIE OTWIERANIA W NOWYM OKNIE (Metoda pewna)
      const links = resultDiv.querySelectorAll('a');
      links.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });

    } else {
      resultDiv.innerHTML = `<p class="text-red-400">Błąd: ${data.error || "Błąd serwera"}</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p class="text-red-300">Błąd połączenia: ${error.message}</p>`;
  } finally {
    hideLoadingModal();
    submitButton.disabled = false;
  }
});
