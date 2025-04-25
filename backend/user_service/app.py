import sqlite3
import os
import contextlib
from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
DB_NAME = "user_data.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_NAME)

@contextlib.contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )
        ''')
        conn.commit()

@app.route("/users", methods=["GET"])
def get_users():
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        users = conn.execute("SELECT * FROM users").fetchall()
        return jsonify([dict(u) for u in users])

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if user:
            return jsonify(dict(user))
        return jsonify({"error": "User not found"}), 404
    
from flask import request  # tambahkan ini di bagian import paling atas

@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
        return jsonify({"message": f"User ID {user_id} dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/users", methods=["POST"])
def add_user():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Name harus diisi"}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (name) VALUES (?)", (name,))
            conn.commit()
            user_id = cursor.lastrowid
        return jsonify({"id": user_id, "name": name}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    init_db()
    app.run(port=5001, debug=True)
