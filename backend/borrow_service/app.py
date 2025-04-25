import sqlite3
import os
import contextlib
import requests
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS


app = Flask(__name__)
CORS(app)
DB_NAME = "borrow_data.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_NAME)

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:5001")
BOOK_SERVICE_URL = os.getenv("BOOK_SERVICE_URL", "http://localhost:5002")

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
            CREATE TABLE IF NOT EXISTS borrows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                borrow_date TEXT NOT NULL,
                duration_days INTEGER NOT NULL,
                due_date TEXT NOT NULL,
                status TEXT NOT NULL
            )
        ''')
        conn.commit()

# --- Validasi ---
def validate_user(user_id):
    try:
        res = requests.get(f"{USER_SERVICE_URL}/users/{user_id}", timeout=5)
        res.raise_for_status()
        return res.json(), None
    except requests.exceptions.RequestException as e:
        return None, f"User {user_id} tidak valid atau tidak ditemukan"

def validate_book(book_id):
    try:
        res = requests.get(f"{BOOK_SERVICE_URL}/books/{book_id}", timeout=5)
        res.raise_for_status()
        return res.json(), None
    except requests.exceptions.RequestException as e:
        return None, f"Book {book_id} tidak valid atau tidak ditemukan"

# --- Endpoint: POST /borrows ---
@app.route("/borrows", methods=["POST"])
def create_borrow():
    data = request.get_json()
    user_id = data.get("user_id")
    book_id = data.get("book_id")
    duration_days = data.get("duration_days", 7)

    if not all([user_id, book_id, duration_days]):
        return jsonify({"error": "user_id, book_id, duration_days diperlukan"}), 400

    user, user_error = validate_user(user_id)
    if user is None:
        return jsonify({"error": user_error}), 404

    book, book_error = validate_book(book_id)
    if book is None:
        return jsonify({"error": book_error}), 404

    today = datetime.now()
    due_date = today + timedelta(days=duration_days)
    status = "Aktif"

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO borrows (user_id, book_id, borrow_date, duration_days, due_date, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                book_id,
                today.strftime("%Y-%m-%d"),
                duration_days,
                due_date.strftime("%Y-%m-%d"),
                status
            ))
            conn.commit()
            borrow_id = cursor.lastrowid
        return jsonify({
            "id": borrow_id,
            "user": user,
            "book": book,
            "borrow_date": today.strftime("%Y-%m-%d"),
            "due_date": due_date.strftime("%Y-%m-%d"),
            "status": status
        }), 201
    except Exception as e:
        app.logger.error(f"Error saving borrow: {e}")
        return jsonify({"error": "Gagal menyimpan data pinjaman"}), 500

# --- Endpoint: GET /borrows ---
@app.route("/borrows", methods=["GET"])
def list_borrows():
    update_expired_statuses()
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM borrows").fetchall()
        return jsonify([dict(row) for row in rows])

# --- Update Status Otomatis ---
def update_expired_statuses():
    today = datetime.now().date()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE borrows
            SET status = 'Jatuh Tempo'
            WHERE status = 'Aktif' AND DATE(due_date) < DATE(?)
        ''', (today,))
        conn.commit()

@app.route("/borrows/<int:borrow_id>", methods=["DELETE"])
def delete_borrow(borrow_id):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM borrows WHERE id = ?", (borrow_id,))
            conn.commit()
        return jsonify({"message": f"Borrow ID {borrow_id} dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    init_db()
    app.run(port=5003, debug=True)
