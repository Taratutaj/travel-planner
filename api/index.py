import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from google.genai.errors import APIError

app = Flask(__name__)
CORS(app) 

# Inicjalizacja klienta - Vercel sam pobierze GEMINI_API_KEY z ustawień projektu
try:
    # Ważne: Vercel automatycznie widzi zmienne środowiskowe, 
    # nie potrzebujesz load_dotenv() na produkcji.
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Błąd inicjalizacji: {e}")
    client = None

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    if not client:
        return jsonify({"error": "Brak konfiguracji API Key na Vercel"}), 500

    try:
        data = request.json
        destination = data.get('destination')
        days = data.get('days')

        if not destination or not days:
            return jsonify({"error": "Brak danych"}), 400

        user_prompt = (
            f"Utwórz szczegółowy, {days}-dniowy plan podróży do {destination}. "
            f"Odpowiedź w języku polskim, w formacie Markdown."
        )

        # ZMIANA: Poprawiona nazwa modelu na istniejącą
        config = types.GenerateContentConfig(
            system_instruction="Jesteś ekspertem ds. podróży.",
            tools=[{"google_search": {}}] 
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash', # <--- Tutaj była literówka (2.5)
            contents=user_prompt,
            config=config,
        )

        sources = []
        if response.candidates and response.candidates[0].grounding_metadata:
            metadata = response.candidates[0].grounding_metadata
            if metadata.grounding_chunks:
                sources = [
                    {"title": chunk.web.title, "uri": chunk.web.uri}
                    for chunk in metadata.grounding_chunks
                    if chunk.web
                ]
        
        return jsonify({
            "plan": response.text,
            "sources": sources
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WAŻNE: Na Vercelu NIE używamy app.run()
# Ten blok zostanie wykonany tylko lokalnie
if __name__ == '__main__':
    app.run(port=5000)

