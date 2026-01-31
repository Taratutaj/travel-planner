// components/PlanForm.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

interface PlanFormProps {
  onSubmit: (destination: string, days: number) => void;
  isLoading?: boolean;
}

export default function PlanForm({
  onSubmit,
  isLoading = false,
}: PlanFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(1);
  const [isPlaceSelected, setIsPlaceSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      const options = {
        types: ["(regions)"],
      };

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options,
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.geometry) {
          setIsPlaceSelected(true);
          setDestination(place.formatted_address || place.name || "");
          inputRef.current?.classList.remove(
            "border-red-500",
            "ring-2",
            "ring-red-500",
          );
        }
      });
    }
  }, [isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    setIsPlaceSelected(false);
    inputRef.current?.classList.remove(
      "border-red-500",
      "ring-2",
      "ring-red-500",
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-select pierwszej opcji jeśli użytkownik nie wybrał z listy
    if (!isPlaceSelected && destination.trim() !== "" && isLoaded) {
      const service = new google.maps.places.AutocompleteService();

      try {
        const predictions = await new Promise<
          google.maps.places.AutocompletePrediction[]
        >((resolve) => {
          service.getPlacePredictions(
            { input: destination, types: ["(regions)"] },
            (results) => resolve(results || []),
          );
        });

        if (predictions && predictions.length > 0) {
          const placesService = new google.maps.places.PlacesService(
            document.createElement("div"),
          );

          await new Promise<void>((resolve) => {
            placesService.getDetails(
              { placeId: predictions[0].place_id },
              (place, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  place
                ) {
                  setDestination(
                    place.formatted_address || place.name || destination,
                  );
                  setIsPlaceSelected(true);
                }
                resolve();
              },
            );
          });
        }
      } catch (error) {
        console.error("Błąd autocomplete:", error);
      }
    }

    // Walidacja końcowa
    if (!isPlaceSelected) {
      inputRef.current?.focus();
      inputRef.current?.classList.add(
        "border-red-500",
        "ring-2",
        "ring-red-500",
      );
      alert("Proszę wpisać nazwę miejsca i wybrać jedną z podpowiedzi.");
      return;
    }

    onSubmit(destination, days);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && document.querySelector(".pac-item-selected")) {
      return; // Pozwól Google Maps obsłużyć
    }
    if (e.key === "Enter") {
      e.preventDefault(); // Zapobiegnij wysyłce bez wyboru
    }
  };

  if (!isLoaded) {
    return (
      <section className="glass-card shadow-2xl">
        <div className="text-center text-white/70">Ładowanie...</div>
      </section>
    );
  }

  return (
    <section className="glass-card shadow-2xl transition-all duration-500">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Twój Plan Podróży
        </h1>
        <p className="text-lg text-white/70">
          Wpisz miejsce i liczbę dni (maks. 3), odbierz gotowy plan w kilka
          sekund.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="destination"
              className="block text-sm font-semibold mb-2 text-white/80 uppercase tracking-wider"
            >
              Miejsce podróży:
            </label>
            <input
              ref={inputRef}
              type="search"
              id="destination"
              name="travel-destination"
              placeholder="np. Paryż, Rzym, Madera"
              value={destination}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              data-lpignore="true"
              required
              disabled={isLoading}
              className="w-full bg-white/50 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all shadow-inner disabled:opacity-50"
            />
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="days"
              className="block text-sm font-semibold mb-2 text-white/80 uppercase tracking-wider"
            >
              Liczba dni (max 3):
            </label>
            <input
              type="number"
              id="days"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              min="1"
              max="3"
              required
              disabled={isLoading}
              className="w-full bg-white/50 border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-inner disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg rounded-xl shadow-lg hover:from-green-500 hover:to-green-400 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">
            {isLoading ? "Generuję..." : "Generuj Mój Plan! ✨"}
          </span>
        </button>
      </form>
    </section>
  );
}
