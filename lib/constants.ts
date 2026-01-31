import { SchemaType } from "@google/generative-ai";

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

export const SYSTEM_INSTRUCTION = `... Twoja treść ...`;
