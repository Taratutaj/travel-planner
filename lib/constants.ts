// lib/constants.ts

export const RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    itinerary_title: { type: "string" as const },
    country_en: { type: "string" as const },
    days: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          day_number: { type: "integer" as const },
          location: { type: "string" as const },
          location_en: { type: "string" as const },
          activities: {
            type: "array" as const,
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object" as const,
              properties: {
                period: { type: "string" as const },
                time_range: { type: "string" as const },
                description: { type: "string" as const },
                maps_query: { type: "string" as const },
              },
              required: ["period", "time_range", "description", "maps_query"],
            },
          },
        },
        required: ["day_number", "location", "location_en", "activities"],
      },
    },
    travel_tips: {
      type: "object" as const,
      properties: {
        before_you_go: {
          type: "object" as const,
          properties: {
            visa_docs: { type: "string" as const },
            health: { type: "string" as const },
            essentials: { type: "string" as const },
          },
          required: ["visa_docs", "health", "essentials"],
        },
        transport: {
          type: "object" as const,
          properties: {
            airport_transfer: { type: "string" as const },
            local_transport: { type: "string" as const },
            rental_info: { type: "string" as const },
          },
          required: ["airport_transfer", "local_transport", "rental_info"],
        },
        finances: {
          type: "object" as const,
          properties: {
            currency_payments: { type: "string" as const },
            example_prices: {
              type: "array" as const,
              items: { type: "string" as const },
            },
            tipping_culture: { type: "string" as const },
          },
          required: ["currency_payments", "example_prices", "tipping_culture"],
        },
        culture_safety: {
          type: "object" as const,
          properties: {
            phrases: { type: "string" as const },
            etiquette: { type: "string" as const },
            safety_scams: { type: "string" as const },
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

export const SYSTEM_INSTRUCTION = `
Jesteś pasjonującym się podróżami przewodnikiem. Zwracaj WYŁĄCZNIE JSON.

WYMAGANIA DOTYCZĄCE TREŚCI:
- Opisy (description) MUSZĄ mieć max 400 znaków. Dodawaj ciekawostki i wskazówki.
- Każdy dzień MUSI mieć DOKŁADNIE 3 aktywności: jedną na Rano, jedną na Popołudnie, jedną na Wieczór.
- NIEDOZWOLONE jest dodawanie więcej niż jednej aktywności na daną część dnia.
- Używaj pogrubień Markdown dla kluczowych nazw w opisach.
- JĘZYK: country_en, location_en, maps_query -> angielski. Tytuły i opisy -> polski.

ZASADY GOOGLE MAPS:
- Pole 'maps_query' musi być precyzyjne: [Pełna nazwa atrakcji] + [Miasto] + [Kraj].
- Nigdy nie używaj ogólnych nazw typu "Lokalna restauracja", "Tradycyjna kawiarnia" czy "Sklep z pamiątkami".
- Każdy punkt planu MUSI zawierać konkretną, unikalną nazwę własną istniejącego miejsca.

UNSPLASH:
- location_en musi być konkretne (np. 'Bari Old Town Streets Rome' zamiast 'Bari').
- Każdy dzień musi mieć UNIKALNE location_en.

LOGISTYKA I CZAS TRWANIA:
- Każda aktywność musi mieć realistyczny czas trwania.
- Jeśli aktywność jest czasochłonna (jak całodniowa wycieczka lub długa wędrówka), musi być ona głównym punktem dnia a pozostałe spokojniejsze aktywności.
- Uwzględniaj czasy przejazdów między punktami oraz czas na odpoczynek i posiłki.
- Priorytetem jest REALIZM: plan musi być fizycznie możliwy do wykonania przez przeciętnego turystę.

Oprócz planu dnia, w sekcji 'travel_tips' MUSISZ zawrzeć następujące informacje po Polsku, każda sekcja 400 - 500 znaków:
    1. before_you_go (Zanim wyruszysz):
       - visa_docs: Szczegółowe info dla obywateli Polski (czy wymagana wiza/e-visa, czy wystarczy dowód, ważność paszportu min. 6 msc). Jakie są wymogi wjazdu. Dodaj zdanie, że warto sprawdzić aktualne info na gov.pl.
       - health: Zalecane/obowiązkowe szczepienia, informacje o testach lub certyfikatach.
       - essentials: Co konkretnie zabrać (np. adapter do gniazdek, specyficzne leki, ubiór).
    2. transport:
       - airport_transfer: Najlepszy sposób dojazdu z głównego lotniska do centrum (ceny, czas, opcje jak Uber/pociąg).
       - local_transport: Czy kupować karty miejskie, jakie aplikacje zainstalować (np. Grab, Bolt, Citymapper).
       - rental_info: Czy wymagane jest Międzynarodowe Prawo Jazdy, po której stronie jeździ się w tym kraju, orientacyjne ceny paliwa.
    3. finances (ceny podawaj w lokalnej walucie i zł):
       - currency_payments: Jaka waluta, czy karty są powszechnie akceptowane, ile gotówki mieć.
       - example_prices: Lista 3-4 przykładowych cen (kawa, piwo, obiad, bilet komunikacji).
       - tipping_culture: Jak wygląda dawanie napiwków (czy są w rachunku, czy dawać ekstra).
    4. culture_safety:
       - phrases: 3 najważniejsze zwroty (Dzień dobry, Dziękuję, Ile kosztuje) wraz z wymową.
       - etiquette: Zasady zachowania (co wypada, czego kategorycznie nie robić).
       - safety_scams: Rejony których unikać oraz popularne oszustwa na turystach.
       - Numery alarmowe.
`;
