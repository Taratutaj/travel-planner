import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError




load_dotenv() # To wczyta klucz z pliku .env do systemu

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
# Używamy CORS, aby umożliwić komunikację między przeglądarką (Front-End) a serwerem (Back-End)
CORS(app) 

# Inicjalizacja klienta Gemini
# Klient automatycznie pobierze klucz API ze zmiennej środowiskowej GEMINI_API_KEY
try:
    client = genai.Client()
except Exception as e:
    print(f"Błąd inicjalizacji klienta Gemini: {e}")
    client = None

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    if not client:
        return jsonify({"error": "Klient Gemini nie został poprawnie zainicjalizowany. Sprawdź GEMINI_API_KEY."}), 500

    try:
        data = request.json
        destination = data.get('destination')
        days = data.get('days')

        if not destination or not days:
            return jsonify({"error": "Wymagane pola: 'destination' i 'days'."}), 400

        # WZMOCNIONY PROMPT Z UŻYCIEM GOOGLE SEARCH
        user_prompt = (
            f"Utwórz szczegółowy, {days}-dniowy plan podróży do {destination}. "
            f"Uwzględnij logistykę, najlepsze restauracje, atrakcje i wydarzenia, używając aktualnych informacji znalezionych w Google Search. "
            f"Zapewnij, że informacje o godzinach otwarcia i cenach są, jeśli to możliwe, oparte na aktualnych danych. "
            f"Odpowiedź w języku polskim, w formacie Markdown."
        )

        print(f"Generowanie planu dla: {destination}, {days} dni.")

        # KONSTRUKCJA REQUESTU Z NARZĘDZIEM GOOGLE SEARCH
        config = types.GenerateContentConfig(
            system_instruction="Jesteś ekspertem ds. podróży i tworzysz wysokiej jakości plany na podstawie aktualnych informacji.",
            tools=[{"google_search": {}}] # KLUCZOWY ELEMENT: Włączenie Google Search
        )

        # Wywołanie API Gemini
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=user_prompt,
            config=config,
        )

        # Obsługa i ekstrakcja źródeł (grounding)
        sources = []
        if response.candidates and response.candidates[0].grounding_metadata and response.candidates[0].grounding_metadata.grounding_chunks:
            # Mapowanie informacji o źródłach
            sources = [
                {"title": chunk.web.title, "uri": chunk.web.uri}
                for chunk in response.candidates[0].grounding_metadata.grounding_chunks
                if chunk.web and chunk.web.uri
            ]
        
        # Przygotowanie odpowiedzi dla Front-Endu
        return jsonify({
            "plan": response.text,
            "sources": sources
        })

    except APIError as e:
        print(f"Błąd API Gemini: {e}")
        return jsonify({"error": f"Błąd w Gemini API: {e}"}), 500
    except Exception as e:
        print(f"Nieoczekiwany błąd: {e}")
        return jsonify({"error": f"Wystąpił nieoczekiwany błąd serwera: {e}"}), 500

if __name__ == '__main__':
    # Używamy portu 5000, zgodnie z konfiguracją w HTML/JS
    app.run(port=5000, debug=True)