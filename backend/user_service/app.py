import sqlite3
import os
import contextlib
from flask import Flask, jsonify

app = Flask(__name__)
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

if __name__ == "__main__":
    init_db()
    app.run(port=5001, debug=True)
