import os
import sys
import json
import requests
from google import genai
from google.genai import types



# Dodaj ścieżkę, aby widzieć schemas.py
sys.path.append(os.path.dirname(__file__))

from schemas import RESPONSE_SCHEMA

def get_unsplash_photo(query):
    """Pobiera zdjęcie z Unsplash po stronie serwera."""
    access_key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not access_key:
        return None
    
    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": query,
        "per_page": 1,
        "orientation": "landscape"
    }
    headers = {"Authorization": f"Client-ID {access_key}"}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                photo = data["results"][0]
                return {
                    "url": photo["urls"]["regular"],
                    "user": photo["user"]["name"],
                    "link": photo["user"]["links"]["html"]
                }
    except Exception as e:
        print(f"Błąd Unsplash: {e}")
    return None

def generate_trip_plan(destination, days):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Brak klucza API")

    client = genai.Client(api_key=api_key)
    
    user_prompt = (
        f"Przygotuj plan podróży do: {destination} na {days} dni. "
        f"W polu 'country_en' wpisz {destination} po angielsku. "
        f"W polu 'location_en' wpisz po angielsku nazwę do zalezienia pasujacego zdjęcia do danego dnia na unsplash"
        f"Reszta opisów ma być po polsku."
    )
s
    config = types.GenerateContentConfig(
        tools=[{"google_search": {}}],
        response_mime_type="application/json",
        response_schema=RESPONSE_SCHEMA,
        system_instruction="Jesteś ekspertem podróży. Zawsze zwracaj JSON."
    )

    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=user_prompt,
        config=config
    )

    sources = []
    if response.candidates and response.candidates[0].grounding_metadata:
        metadata = response.candidates[0].grounding_metadata
        if metadata.grounding_chunks:
            for chunk in metadata.grounding_chunks:
                if chunk.web:
                    sources.append({"title": chunk.web.title, "uri": chunk.web.uri})
    
    plan_data = json.loads(response.text)
    country_tag = plan_data.get("country_en", "")

    # Iterujemy po dniach i dla każdego szukamy zdjęcia
    if "days" in plan_data:
        for day in plan_data["days"]:
            location_query = f"{day.get('location_en', '')}".strip()
            print(f"Szukam zdjęcia dla: {location_query}") # Log w konsoli serwera
            
            photo = get_unsplash_photo(location_query)
            
            if photo:
                day["imageUrl"] = photo["url"]
                day["photoAuthor"] = photo["user"]
                day["photoAuthorLink"] = photo["link"]
            else:
                # Zdjęcie rezerwowe w razie problemów
                day["imageUrl"] = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200"
                day["photoAuthor"] = "Unsplash"
                day["photoAuthorLink"] = "#"

    return plan_data, sources

