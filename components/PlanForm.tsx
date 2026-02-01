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
  const [isDestinationConfirmed, setIsDestinationConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const selectedPlaceRef = useRef<string | null>(null);

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
          const selectedName = place.formatted_address || place.name || "";
          setDestination(selectedName);
          selectedPlaceRef.current = selectedName;
          setIsDestinationConfirmed(true);

          // Przenieś focus na input dni
          setTimeout(() => {
            document.getElementById("days")?.focus();
          }, 100);
        }
      });
    }
  }, [isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    selectedPlaceRef.current = null;
    setIsDestinationConfirmed(false);
  };

  const handleDestinationKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Jeśli Enter i nie wybrano jeszcze miejsca z listy
    if (e.key === "Enter" && !isDestinationConfirmed) {
      e.preventDefault(); // Zatrzymaj submit formularza

      if (destination.trim() === "") {
        return;
      }

      // Sprawdź czy to nie jest wybór z listy Google
      if (document.querySelector(".pac-item-selected")) {
        return; // Pozwól Google obsłużyć
      }

      // Auto-uzupełnij pierwszą sugestią
      await autoCompleteDestination();
    }
  };

  const autoCompleteDestination = async () => {
    if (!isLoaded || destination.trim() === "") return;

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

        const placeDetails =
          await new Promise<google.maps.places.PlaceResult | null>(
            (resolve) => {
              placesService.getDetails(
                { placeId: predictions[0].place_id },
                (place, status) => {
                  if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    place
                  ) {
                    resolve(place);
                  } else {
                    resolve(null);
                  }
                },
              );
            },
          );

        if (placeDetails) {
          const confirmedDestination =
            placeDetails.formatted_address || placeDetails.name || destination;

          setDestination(confirmedDestination);
          selectedPlaceRef.current = confirmedDestination;
          setIsDestinationConfirmed(true);

          // Przenieś focus na input dni
          setTimeout(() => {
            document.getElementById("days")?.focus();
          }, 100);
        }
      } else {
        // Brak sugestii - zostaw to co użytkownik wpisał
        setIsDestinationConfirmed(true);
        setTimeout(() => {
          document.getElementById("days")?.focus();
        }, 100);
      }
    } catch (error) {
      console.error("Błąd autocomplete:", error);
      setIsDestinationConfirmed(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (destination.trim() === "") {
      alert("Proszę wpisać nazwę miejsca.");
      inputRef.current?.focus();
      return;
    }

    // Jeśli użytkownik nie potwierdził destinacji Enterem, zrób to teraz
    if (!isDestinationConfirmed && !selectedPlaceRef.current) {
      await autoCompleteDestination();
      return; // Nie submituj jeszcze, użytkownik zobaczy uzupełnioną nazwę
    }

    const finalDestination = selectedPlaceRef.current || destination;
    onSubmit(finalDestination, days);
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
          Wpisz nazwę miasta i liczbę dni, a my przygotujemy dla Ciebie
          niesamowity plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="destination"
              className="block text-sm font-semibold mb-2 text-white/80 uppercase tracking-wider"
            >
              Dokąd się wybierasz?
            </label>
            <input
              ref={inputRef}
              type="search"
              id="destination"
              name="travel-destination"
              placeholder="Zacznij pisać: Paryż, Rzym, Gdańsk..."
              value={destination}
              onChange={handleInputChange}
              onKeyDown={handleDestinationKeyDown}
              autoComplete="off"
              data-lpignore="true"
              required
              disabled={isLoading}
              className={`w-full bg-white/15 border ${
                isDestinationConfirmed
                  ? "border-green-400/50 ring-2 ring-green-400/30"
                  : "border-white/20"
              } rounded-xl px-5 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all shadow-inner disabled:opacity-50`}
            />
            <p className="text-xs text-white/40 mt-2">
              {isDestinationConfirmed ? (
                <span className="text-green-400">
                  ✓ Miejsce potwierdzone! Teraz wybierz liczbę dni.
                </span>
              ) : (
                <span> </span>
              )}
            </p>
          </div>

          <div className="md:col-span-1">
            <label
              htmlFor="days"
              className="block text-sm font-semibold mb-2 text-white/80 uppercase tracking-wider"
            >
              Ile dni? (max 3)
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
              className="w-full bg-white/15 border border-white/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-inner disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isDestinationConfirmed}
          className="group relative w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg rounded-xl shadow-lg hover:from-green-500 hover:to-green-400 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">
            {isLoading ? "Tworzę Twój plan..." : "Stwórz Plan Podróży! ✨"}
          </span>
        </button>
      </form>
    </section>
  );
}
