import os
from flask import Flask
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all origins (for development only!)

DATABASE_URL = os.environ.get('DATABASE_URL')

@app.route("/")
def hello():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        db_version = cur.fetchone()[0]
        conn.close()
        return f"Hello from Flask! Database version: {db_version}"
    except Exception as e:
        return f"Error connecting to database: {e}"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    app.run(debug=True, host='0.0.0.0', port=port)
