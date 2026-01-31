// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION,
  FALLBACK_IMAGES,
} from "./constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface UnsplashPhoto {
  id: string;
  url: string;
  user: string;
  link: string;
}

interface Activity {
  period: string;
  time_range: string;
  description: string;
  maps_query: string;
  maps_url?: string;
}

interface Day {
  day_number: number;
  location: string;
  location_en: string;
  activities: Activity[];
  imageUrl?: string;
  photoAuthor?: string;
  photoAuthorLink?: string;
  used_query?: string;
}

interface TripPlan {
  itinerary_title: string;
  country_en: string;
  days: Day[];
  travel_tips: any;
}

function buildGoogleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

async function getUnsplashPhoto(
  query: string,
  usedIds: string[] = [],
): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return null;
  }

  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.append("query", query);
    url.searchParams.append("per_page", "10");
    url.searchParams.append("orientation", "landscape");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const results = data.results || [];

    // Szukamy pierwszego zdjęcia, którego nie ma w usedIds
    for (const photo of results) {
      if (!usedIds.includes(photo.id)) {
        return {
          id: photo.id,
          url: photo.urls.regular,
          user: photo.user.name,
          link: photo.links.html,
        };
      }
    }

    // Jeśli wszystkie są użyte, bierzemy pierwsze
    if (results.length > 0) {
      return {
        id: results[0].id,
        url: results[0].urls.regular,
        user: results[0].user.name,
        link: results[0].links.html,
      };
    }
  } catch (error) {
    console.error("Błąd Unsplash:", error);
  }

  return null;
}

export async function generateTripPlan(destination: string, days: number) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const userPrompt = `Przygotuj niesamowicie szczegółowy plan podróży do: ${destination} na ${days} dni. Opisy każdej aktywności muszą być długie, wciągające i zawierać porady dla turystów. Wypełnij pola 'country_en' i 'location_en' po angielsku.`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const response = result.response;
  const planData: TripPlan = JSON.parse(response.text());

  const usedPhotoIds: string[] = [];
  const countryTag = planData.country_en || "";

  if (planData.days) {
    for (const day of planData.days) {
      // 1. Obsługa linków do Map
      for (const act of day.activities) {
        if (act.maps_query) {
          act.maps_url = buildGoogleMapsUrl(act.maps_query);
        }
      }

      // 2. Obsługa zdjęć
      const rawLoc = day.location_en || "";
      const locationQuery = `${rawLoc} ${countryTag}`.trim();
      day.used_query = locationQuery;

      const photo = await getUnsplashPhoto(locationQuery, usedPhotoIds);

      if (photo) {
        day.imageUrl = photo.url;
        day.photoAuthor = photo.user;
        day.photoAuthorLink = photo.link;
        usedPhotoIds.push(photo.id);
      } else {
        // Fallback do lokalnych zdjęć
        const availableLocal = FALLBACK_IMAGES.filter(
          (img) => !usedPhotoIds.includes(img),
        );

        const chosenFallback =
          availableLocal.length > 0
            ? availableLocal[Math.floor(Math.random() * availableLocal.length)]
            : FALLBACK_IMAGES[
                Math.floor(Math.random() * FALLBACK_IMAGES.length)
              ];

        day.imageUrl = chosenFallback;
        day.photoAuthor = "Lokalne zasoby";
        day.photoAuthorLink = "#";
        usedPhotoIds.push(chosenFallback);
      }
    }
  }

  return { plan: planData, sources: [] };
}
