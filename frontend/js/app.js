const USER_API = "http://localhost:5001/users";
const BOOK_API = "http://localhost:5002/books";
const BORROW_API = "http://localhost:5003/borrows";

let books = [];
let users = [];

async function loadBooks() {
    const res = await fetch(BOOK_API);
    books = await res.json();
    displayBooks(books);
}

function displayBooks(data) {
    const list = document.getElementById("book-list");
    list.innerHTML = "";
    data.forEach(b => {
        const li = document.createElement("li");
        li.textContent = `#${b.id} - ${b.title} (Rp ${b.price})`;
        list.appendChild(li);
    });
}

function filterBooks() {
    const keyword = document.getElementById("search-book").value.toLowerCase();
    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(keyword) || String(b.id).includes(keyword)
    );
    displayBooks(filtered);
}

async function loadUsers() {
    const res = await fetch(USER_API);
    users = await res.json();
}

function getUserIdByName(name) {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    return user ? user.id : null;
}

document.getElementById("borrow-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user-id").value;
    const user_id = getUserIdByName(name);
    const book_id = parseInt(document.getElementById("book-id").value);
    const duration_days = parseInt(document.getElementById("duration-days").value);

    if (!user_id) return alert("Nama user tidak ditemukan");

    const res = await fetch(BORROW_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, book_id, duration_days })
    });
    const result = await res.json();
    document.getElementById("result").textContent = JSON.stringify(result, null, 2);
});

async function loadBorrows() {
    const res = await fetch(BORROW_API);
    const borrows = await res.json();
    document.getElementById("borrow-list").textContent = JSON.stringify(borrows, null, 2);
}

function showBookForm() {
    document.getElementById("add-book-section").style.display = "block";
}

document.getElementById("add-book-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("book-title").value;
    const price = parseFloat(document.getElementById("book-price").value);

    const res = await fetch(BOOK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, price })
    });

    const data = await res.json();
    alert("Buku ditambahkan!");
    loadBooks();
});

window.addEventListener("DOMContentLoaded", async () => {
    await loadBooks();
    await loadUsers();
});

