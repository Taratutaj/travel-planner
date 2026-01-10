import os
import sys
from supabase import create_client, Client
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# 1. Poprawa ścieżek i importów
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from services import generate_trip_plan

# 2. Inicjalizacja klienta Supabase z obsługą błędów
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Klient zainicjalizuje się tylko jeśli klucze istnieją (dobre dla stabilności)
supabase = None
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

@app.route('/api/generate_plan', methods=['POST'])
def handle_plan():
    try:
        data = request.json
        destination = data.get('destination')
        days = data.get('days')

        # Generujemy plan za pomocą istniejącej funkcji
        plan, sources = generate_trip_plan(destination, days)

        plan_id = None
        # 3. Zapis do Supabase jeśli klient jest aktywny
        if supabase:
            try:
                # Przygotowujemy dane do zapisu
                record = {
                    "destination": destination,
                    "plan_data": {"plan": plan, "sources": sources}
                }
                # Wstawiamy do tabeli 'plans'
                insert_result = supabase.table("plans").insert(record).execute()
                
                # Pobieramy ID zapisanego planu
                if len(insert_result.data) > 0:
                    plan_id = insert_result.data[0]['id']
            except Exception as db_err:
                print(f"Błąd zapisu do bazy: {db_err}")
                # Kontynuujemy nawet jeśli baza zawiedzie, żeby zwrócić plan użytkownikowi

        # Zwracamy plan oraz id z bazy danych
        return jsonify({
            "plan": plan, 
            "sources": sources,
            "id": plan_id  # To ID posłuży do udostępniania
        })

    except Exception as e:
        print(f"Błąd główny: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
