import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types

# ZMIANA: static_folder wskazuje na folder 'static' o jeden poziom wyżej
# template_folder wskazuje na folder główny (tam gdzie jest index.html)
app = Flask(__name__, 
            static_folder='../static', 
            static_url_path='/static')
CORS(app) 

try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
    else:
        print("BŁĄD: Nie znaleziono klucza GEMINI_API_KEY w zmiennych środowiskowych!")
        client = None
except Exception as e:
    print(f"Błąd inicjalizacji klienta: {e}")
    client = None

# Trasa dla strony głównej - szuka index.html w folderze głównym (poziom wyżej niż /api)
@app.route('/')
def index():
    return send_from_directory('..', 'index.html')

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    if not client:
        return jsonify({"error": "Brak klucza API"}), 500

    try:
        data = request.json
        destination = data.get('destination')
        days = data.get('days')

        if not destination or not days:
            return jsonify({"error": "Brak danych"}), 400

        user_prompt = (
           # f"Utwórz szczegółowy, {days}-dniowy plan podróży do {destination}. "
           # f"Odpowiedź w języku polskim, w formacie Markdown."
            f"Działaj jako profesjonalny doradca turystyczny. Utwórz szczegółowy, {days}-dniowy plan podróży do {destination}.\n\n"
            f"ZASADA SPECJALNA:\n"
            f"- Jeśli '{destination}' nie jest istniejącym miejscem na Ziemi, do którego można podróżować, odpowiedz krótko i uprzejmie, że nie możesz przygotować takiego planu.\n\n"
            f"WYMAGANIA DOTYCZĄCE TREŚCI:\n"
            f"- Każdy dzień podziel na sekcje: Poranek, Popołudnie i Wieczór.\n"
            f"- Dodaj konkretne rekomendacje lokalnych potraw lub restauracji.\n"
            f"- Uwzględnij praktyczne wskazówki dotyczące transportu i logistyki.\n"
            f"- Znajdź balans między głównymi atrakcjami a mniej znanymi miejscami (hidden gems).\n\n"
            f"FORMATOWANIE (Markdown):\n"
            f"- Użyj nagłówków '## Dzień X: [Nazwa Motywu Dnia]'.\n"
            f"- Nazwy kluczowych miejsc pogrubiaj za pomocą **gwiazdek**.\n"
            f"- Odpowiedź musi być w całości w języku polskim."
                    
        )

        config = types.GenerateContentConfig(
            system_instruction="Jesteś ekspertem ds. podróży.",
            tools=[{"google_search": {}}] 
        )

        response = client.models.generate_content(
            model='gemini-2.5-flash', 
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

if __name__ == '__main__':

    app.run(port=5000, debug=True)
