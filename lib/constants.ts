import { Schema, SchemaType } from "@google/generative-ai";

export const RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    itinerary_title: { type: SchemaType.STRING },
    country_en: { type: SchemaType.STRING },
    days: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day_number: { type: SchemaType.INTEGER },
          location: { type: SchemaType.STRING },
          location_en: { type: SchemaType.STRING },
          activities: {
            type: SchemaType.ARRAY,
            // Gemini automatycznie obsłuży min/max na podstawie instrukcji systemowej
            items: {
              type: SchemaType.OBJECT,
              properties: {
                period: { type: SchemaType.STRING },
                time_range: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                maps_query: { type: SchemaType.STRING },
              },
              required: ["period", "time_range", "description", "maps_query"],
            },
          },
        },
        required: ["day_number", "location", "location_en", "activities"],
      },
    },
    travel_tips: {
      type: SchemaType.OBJECT,
      properties: {
        before_you_go: {
          type: SchemaType.OBJECT,
          properties: {
            visa_docs: { type: SchemaType.STRING },
            health: { type: SchemaType.STRING },
            essentials: { type: SchemaType.STRING },
          },
          required: ["visa_docs", "health", "essentials"],
        },
        transport: {
          type: SchemaType.OBJECT,
          properties: {
            airport_transfer: { type: SchemaType.STRING },
            local_transport: { type: SchemaType.STRING },
            rental_info: { type: SchemaType.STRING },
          },
          required: ["airport_transfer", "local_transport", "rental_info"],
        },
        finances: {
          type: SchemaType.OBJECT,
          properties: {
            currency_payments: { type: SchemaType.STRING },
            example_prices: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            tipping_culture: { type: SchemaType.STRING },
          },
          required: ["currency_payments", "example_prices", "tipping_culture"],
        },
        culture_safety: {
          type: SchemaType.OBJECT,
          properties: {
            phrases: { type: SchemaType.STRING },
            etiquette: { type: SchemaType.STRING },
            safety_scams: { type: SchemaType.STRING },
          },
          required: ["phrases", "etiquette", "safety_scams"],
        },
      },
      required: ["before_you_go", "transport", "finances", "culture_safety"],
    },
  },
  required: ["itinerary_title", "country_en", "days", "travel_tips"],
};

export const FALLBACK_IMAGES = [
  "/images/image1.jpg",
  "/images/image2.jpg",
  "/images/image3.jpg",
  "/images/image4.jpg",
  "/images/image5.jpg",
  "/images/image6.jpg",
  "/images/image7.jpg",
];

export const SYSTEM_INSTRUCTION = `Jesteś pasjonującym się podróżami przewodnikiem. Zwracaj WYŁĄCZNIE JSON.

WYMAGANIA DOTYCZĄCE TREŚCI:
- Opisy (description) MUSZĄ mieć max 400 znaków. Dodawaj ciekawostki i wskazówki.
- Każdy dzień MUSI mieć DOKŁADNIE 3 aktywności: jedną na Rano, jedną na Popołudnie, jedną na Wieczór.
- Używaj pogrubień Markdown dla kluczowych nazw w opisach.
- JĘZYK: country_en, location_en, maps_query -> angielski. Tytuły, opisy oraz travel_tips -> polski.

ZASADY GOOGLE MAPS:
- Pole 'maps_query' musi być precyzyjne: [Pełna nazwa atrakcji] + [Miasto] + [Kraj].
- Każdy punkt planu MUSI zawierać konkretną, unikalną nazwę własną istniejącego miejsca.

UNSPLASH:
- location_en musi być konkretne (np. 'Bari Old Town Streets' zamiast 'Bari').

Oprócz planu dnia, w sekcji 'travel_tips' MUSISZ zawrzeć informacje po POLSKU (każda sekcja 400-500 znaków):
1. before_you_go: Info o wizach dla Polaków i wymogach dotyczących wjazdu, poradź żeby zawsze sprawdzać najnowsze informacje na stronie gov.pl, zdrowiu i co zabrać.
2. transport: Transfer z lotniska, transport lokalny, wynajem auta.
3. finances: Waluta, ceny w lokalnej walucie i PLN, napiwki.
4. culture_safety: Zwroty, etykieta, bezpieczeństwo i numery alarmowe.
`;
