import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types

app = Flask(__name__, static_folder='../static', static_url_path='/static')
CORS(app)

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# --- ZMODYFIKOWANY SCHEMAT W PYTHON ---
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "itinerary_title": {"type": "STRING"},
        "country_en": {"type": "STRING"}, # NOWE POLE: Kraj po angielsku dla całego planu
        "days": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "day_number": {"type": "INTEGER"},
                    "location": {"type": "STRING"},
                    "location_en": {"type": "STRING"},
                    "activities": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "period": {"type": "STRING"},
                                "time_range": {"type": "STRING"},
                                "description": {"type": "STRING"}
                            },
                            "required": ["period", "time_range", "description"]
                        }
                    }
                },
                "required": ["day_number", "location", "location_en", "activities"]
            }
        }
    },
    "required": ["itinerary_title", "country_en", "days"]
}

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

        # --- POPRAWIONY PROMPT ---
        user_prompt = (
            f"Przygotuj plan podróży do: {destination} na {days} dni. "
            f"W polu 'country_en' wpisz {destination} po angielsku. "
            f"W polu 'location_en' wpisz angielską nazwę atrakcji/miejsca na dany dzień. "
            f"Reszta opisów ma być po polsku."
)

        config = types.GenerateContentConfig(
            tools=[{"google_search": {}}],
            response_mime_type="application/json",
            response_schema=RESPONSE_SCHEMA,
            system_instruction="Jesteś ekspertem podróży. Zawsze zwracaj dane w formacie JSON zgodnym ze schematem."
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
                        sources.append({
                            "title": chunk.web.title,
                            "uri": chunk.web.uri
                        })

        plan_json = json.loads(response.text)

        return jsonify({
            "plan": plan_json,
            "sources": sources
        })

    except Exception as e:
        print(f"Błąd: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)