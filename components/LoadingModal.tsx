// components/LoadingModal.tsx
"use client";

import { useEffect, useState } from "react";

const travelFacts = [
  "Ciekawostka: Najkrótszy lot na świecie trwa tylko 2 minuty – między szkockimi wyspami Westray i Papa Westray.",
  "Ciekawostka: Pustynia Sahara była kiedyś zieloną sawanną, pełną zwierząt i rzek.",
  "Ciekawostka: Na Malcie znajduje się więcej zabytkowych budowli na metr kwadratowy niż gdziekolwiek indziej na świecie.",
  "Ciekawostka: W Wenecji jest około 400 mostów, ale tylko jeden z nich ma nazwę 'Most Westchnień'.",
  "Ciekawostka: Australia jest szersza niż Księżyc.",
  "Ciekawostka: Najwyższy wodospad na świecie, Salto Angel, jest blisko 15 razy wyższy niż Niagara.",
  "Ciekawostka: Rosja obejmuje 11 stref czasowych – to najwięcej na świecie!",
  "Ciekawostka: Arabia Saudyjska to największy kraj na świecie, w którym nie ma ani jednej stałej rzeki.",
  "Ciekawostka: Singapur jest jednym z niewielu państw-miast na świecie, w którym nie ma rolnictwa.",
  "Ciekawostka: W Finlandii jest więcej saun niż samochodów osobowych – to ponad 3 miliony saun na 5,5 mln mieszkańców!",
  "Ciekawostka: Najrzadziej odwiedzanym krajem świata jest Nauru – rocznie przyjeżdża tam tylko około 200 turystów.",
  "Ciekawostka: W Mongolii żyje więcej koni niż ludzi. To kraj o najniższej gęstości zaludnienia na świecie.",
  "Ciekawostka: Watykan jest tak mały, że cały kraj można przejść pieszo w mniej niż godzinę.",
  "Ciekawostka: Najkrótsza rzeka świata, D-River w USA, ma zaledwie 37 metrów długości.",
  "Ciekawostka: W Japonii znajduje się hotel Nishiyama Onsen Keiunkan, który działa nieprzerwanie od 705 roku n.e.!",
  "Ciekawostka: Papuę-Nową Gwineę zamieszkują społeczności posługujące się ponad 820 różnymi językami.",
];

interface LoadingModalProps {
  isOpen: boolean;
}

export default function LoadingModal({ isOpen }: LoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [fact, setFact] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Zwiększ key żeby wymusić re-render paska (resetuje animację CSS)
      setKey((prev) => prev + 1);

      // Reset progress do 0
      setProgress(0);

      // Losuj nowy fakt
      setFact(travelFacts[Math.floor(Math.random() * travelFacts.length)]);

      // Start animacji po małym opóźnieniu (żeby CSS się zresetowało)
      const timer = setTimeout(() => {
        setProgress(85);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="loading-content glass-card max-w-md w-full text-center p-10">
        <div className="mb-6">
          <i className="fas fa-globe-europe fa-4x text-green-400 globe-spin"></i>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-white">
          Generowanie Niezapomnianej Podróży...
        </h2>

        <div className="progress-bar w-full h-2.5 bg-white/20 rounded-full overflow-hidden mb-6">
          <div
            key={key}
            className="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-[10000ms] ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-lg italic text-white/80 min-h-[3rem]">{fact}</p>
      </div>
    </div>
  );
}
