import os
import sys
import json
import requests
import urllib.parse
import random
from google import genai
from google.genai import types

# Lista Twoich lokalnych zdjęć zastępczych
FALLBACK_IMAGES = [
    "/static/images/image1.jpg",
    "/static/images/image2.jpg",
    "/static/images/image3.jpg",
    "/static/images/image4.jpg",
    "/static/images/image5.jpg",
    "/static/images/image6.jpg",
    "/static/images/image7.jpg",
]

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from schemas import RESPONSE_SCHEMA


def build_google_maps_url(query):
    # Poprawiony URL do wyszukiwania w Google Maps
    return "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(
        query
    )


def get_unsplash_photo(query, used_ids=None):
    if used_ids is None:
        used_ids = []

    access_key = os.environ.get("UNSPLASH_ACCESS_KEY")
    # Jeśli brak klucza, zwracamy None, co wymusi użycie FALLBACK_IMAGES w głównej funkcji
    if not access_key:
        return None

    url = "https://api.unsplash.com/search/photos"
    params = {"query": query, "per_page": 10, "orientation": "landscape"}
    headers = {"Authorization": f"Client-ID {access_key}"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])

            # Szukamy pierwszego zdjęcia, którego jeszcze nie ma w used_ids
            for photo in results:
                if photo["id"] not in used_ids:
                    return {
                        "id": photo["id"],
                        "url": photo["urls"]["regular"],
                        "user": photo["user"]["name"],
                        "link": photo["links"]["html"],
                    }

            # Jeśli wszystkie z wyników są już użyte, bierzemy pierwsze z brzegu
            if results:
                return {
                    "id": results[0]["id"],
                    "url": results[0]["urls"]["regular"],
                    "user": results[0]["user"]["name"],
                    "link": results[0]["links"]["html"],
                }
    except Exception as e:
        print(f"Błąd Unsplash: {e}")
        pass

    return None


def generate_trip_plan(destination, days):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Brak klucza API Gemini")

    client = genai.Client(api_key=api_key)

    user_prompt = (
        f"Przygotuj niesamowicie szczegółowy plan podróży do: {destination} na {days} dni. "
        f"Opisy każdej aktywności muszą być długie, wciągające i zawierać porady dla turystów. "
        f"Wypełnij pola 'country_en' i 'location_en' po angielsku."
    )

    config = types.GenerateContentConfig(
        #tools=[{"google_search": {}}],
        response_mime_type="application/json",
        response_schema=RESPONSE_SCHEMA,
        system_instruction="""
Jesteś pasjonującym się podróżami przewodnikiem. Zwracaj WYŁĄCZNIE JSON.

WYMAGANIA DOTYCZĄCE TREŚCI:
- Opisy (description) MUSZĄ mieć min. 4-5 zdań. Dodawaj ciekawostki i wskazówki.
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
- Jeśli aktywność jest czasochłonna (jak całodniowa wycieczka lub długa wędrówka), musi być ona głównym punktem dnia a pozostałe spokojniesze aktywnoci.
- Uwzględniaj czasy przejazdów między punktami oraz czas na odpoczynek i posiłki.
- Priorytetem jest REALIZM: plan musi być fizycznie możliwy do wykonania przez przeciętnego turystę.

Oprócz planu dnia, w sekcji 'travel_tips' MUSISZ zawrzeć następujące informacje po Polsku:
    1. before_you_go (Zanim wyruszysz):
       - visa_docs: Szczegółowe info dla obywateli Polski (czy wymagana wiza/e-visa, czy wystarczy dowód, ważność paszportu min. 6 msc). Dodaj zdanie, że warto sprawdzić aktualne info na gov.pl.
       - health: Zalecane/obowiązkowe szczepienia, informacje o testach lub certyfikatach.
       - essentials: Co konkretnie zabrać (np. adapter do gniazdek, specyficzne leki, ubiór).
    2. transport:
       - airport_transfer: Najlepszy sposób dojazdu z głównego lotniska do centrum (ceny, czas, opcje jak Uber/pociąg).
       - local_transport: Czy kupować karty miejskie, jakie aplikacje zainstalować (np. Grab, Bolt, Citymapper).
       - rental_info: Czy wymagane jest Międzynarodowe Prawo Jazdy, po której stronie jeździ się w tym kraju, orientacyjne ceny paliwa.
    3. finances (ceny podawaj w lokalnej walucie i zł):
       - currency_payments: Jaka waluta, czy Revolut/karty są powszechnie akceptowane, ile gotówki mieć na bazary.
       - example_prices: Lista 3-4 przykładowych cen (kawa, piwo, obiad, bilet komunikacji).
       - tipping_culture: Jak wygląda dawanie napiwków (czy są w rachunku, czy dawać ekstra).
    4. culture_safety:
       - phrases: 3 najważniejsze zwroty (Dzień dobry, Dziękuję, Ile kosztuje) wraz z wymową.
       - etiquette: Zasady zachowania (co wypada, czego kategorycznie nie robić).
       - safety_scams: Rejony których unikać oraz popularne oszustwa na turystach.
""",
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=user_prompt, config=config
    )

    sources = []
    if response.candidates and response.candidates[0].grounding_metadata:
        metadata = response.candidates[0].grounding_metadata
        if metadata.grounding_chunks:
            for chunk in metadata.grounding_chunks:
                if chunk.web:
                    sources.append({"title": chunk.web.title, "uri": chunk.web.uri})

    plan_data = json.loads(response.text)
    used_photo_ids = []
    country_tag = plan_data.get("country_en", "")

    if "days" in plan_data:
        for day in plan_data["days"]:
            # 1. Obsługa linków do Map
            for act in day.get("activities", []):
                if act.get("maps_query"):
                    act["maps_url"] = build_google_maps_url(act["maps_query"])

            # 2. Obsługa zdjęć
            raw_loc = day.get("location_en", "")
            location_query = f"{raw_loc} {country_tag}".strip()
            day["used_query"] = location_query

            photo = get_unsplash_photo(location_query, used_ids=used_photo_ids)

            if photo:
                day["imageUrl"] = photo["url"]
                day["photoAuthor"] = photo["user"]
                day["photoAuthorLink"] = photo["link"]
                used_photo_ids.append(photo.get("id"))
            else:
                # --- LOGIKA DLA TWOICH LOKALNYCH ZDJĘĆ ---
                # Wybieramy tylko te zdjęcia, których ścieżka nie jest jeszcze w used_photo_ids
                available_local = [
                    img for img in FALLBACK_IMAGES if img not in used_photo_ids
                ]

                # Jeśli wykorzystaliśmy już wszystkie 7, resetujemy wybór
                if not available_local:
                    available_local = FALLBACK_IMAGES

                chosen_fallback = random.choice(available_local)

                day["imageUrl"] = chosen_fallback
                day["photoAuthor"] = "Lokalne zasoby"
                day["photoAuthorLink"] = "#"
                # Dodajemy ścieżkę do użytych, aby przy następnym dniu została odfiltrowana
                used_photo_ids.append(chosen_fallback)

    return plan_data, sources
