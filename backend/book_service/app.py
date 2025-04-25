import sqlite3
import os
import contextlib
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_NAME = "book_data.db"
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
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT NOT NULL,
                title TEXT NOT NULL
            )
        ''')
        conn.commit()

@app.route("/books", methods=["GET"])
def get_books():
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        books = conn.execute("SELECT * FROM books").fetchall()
        return jsonify([dict(b) for b in books])

@app.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        book = conn.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
        if book:
            return jsonify(dict(book))
        return jsonify({"error": "Book not found"}), 404

@app.route("/books", methods=["POST"])
def add_book():
    data = request.get_json()
    author = data.get("author")
    title = data.get("title")

    if not author or not title:
        return jsonify({"error": "author dan title wajib diisi"}), 400

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO books (author, title) VALUES (?, ?)", (author, title))
            conn.commit()
            book_id = cursor.lastrowid
        return jsonify({"id": book_id, "author": author, "title": title}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
            conn.commit()
        return jsonify({"message": f"Book ID {book_id} dihapus"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    init_db()
    app.run(port=5002, debug=True)
