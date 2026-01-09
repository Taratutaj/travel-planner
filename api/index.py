import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# 1. To rozwiązuje problemy z importami (naprawia "ImportError")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from services import generate_trip_plan

# 2. To rozwiązuje problemy ze ścieżkami (naprawia "404 Not Found")
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
        plan, sources = generate_trip_plan(data.get('destination'), data.get('days'))
        return jsonify({"plan": plan, "sources": sources})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)