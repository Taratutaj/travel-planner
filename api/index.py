import os
import sys
from supabase import create_client, Client
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# 1. Poprawa ścieżek i importów
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from services import generate_trip_plan

# 2. Inicjalizacja klienta Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

app = Flask(__name__, 
            static_folder=os.path.join(ROOT_DIR, 'static'), 
            static_url_path='/static')
CORS(app)

@app.route('/')
def index():
    return send_from_directory(ROOT_DIR, 'index.html')

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory(os.path.join(ROOT_DIR, 'js'), path)

# NOWY ENDPOINT: Pobieranie istniejącego planu z bazy danych
@app.route('/api/get_plan/<plan_id>', methods=['GET'])
def get_plan(plan_id):
    if not supabase:
        return jsonify({"error": "Baza danych nie jest skonfigurowana"}), 500
    
    try:
        # Pobieramy wiersz, gdzie id zgadza się z parametrem w URL
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        
        if response.data and len(response.data) > 0:
            return jsonify(response.data[0])
        else:
            return jsonify({"error": "Nie znaleziono planu"}), 404
    except Exception as e:
        print(f"Błąd podczas pobierania planu: {e}")
        return jsonify({"error": "Wystąpił błąd serwera"}), 500

# ISTNIEJĄCY ENDPOINT: Generowanie i zapisywanie nowego planu
@app.route('/api/generate_plan', methods=['POST'])
def handle_plan():
    try:
        data = request.json
        destination = data.get('destination')
        days = data.get('days')

        # Generujemy plan (Gemini + Unsplash/Google)
        plan, sources = generate_trip_plan(destination, days)

        plan_id = None
        # Zapis do Supabase
        if supabase:
            try:
                record = {
                    "destination": destination,
                    "plan_data": {"plan": plan, "sources": sources}
                }
                insert_result = supabase.table("plans").insert(record).execute()
                
                if insert_result.data and len(insert_result.data) > 0:
                    plan_id = insert_result.data[0]['id']
            except Exception as db_err:
                print(f"Błąd zapisu do bazy: {db_err}")

        return jsonify({
            "plan": plan, 
            "sources": sources,
            "id": plan_id  
        })

    except Exception as e:
        print(f"Błąd główny: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
