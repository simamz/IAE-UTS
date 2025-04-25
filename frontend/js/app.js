const USER_API = "http://localhost:5001/users";
const BOOK_API = "http://localhost:5002/books";
const BORROW_API = "http://localhost:5003/borrows";

let books = [];
let users = [];

// Load and Display Books
async function loadBooks() {
    const res = await fetch(BOOK_API);
    books = await res.json();
    displayBooks(books);
}

function displayBooks(data) {
    const list = document.getElementById("book-list");
    list.innerHTML = "";
    data.forEach(book => {
        const li = document.createElement("li");
        li.innerHTML = `#${book.id} - "${book.title}" oleh ${book.author} <button onclick="deleteBook(${book.id})">🗑️</button>`;
        list.appendChild(li);
    });
}

function filterBooks() {
    const keyword = document.getElementById("search-book").value.toLowerCase();
    const filtered = books.filter(book =>
        book.title.toLowerCase().includes(keyword) || String(book.id).includes(keyword)
    );
    displayBooks(filtered);
}

// Load and Display Users
async function loadUsers() {
    const res = await fetch(USER_API);
    users = await res.json();
    displayUsers(users);
}

function displayUsers(data) {
    const list = document.getElementById("user-list");
    list.innerHTML = "";
    data.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `#${user.id} - ${user.name} <button onclick="deleteUser(${user.id})">🗑️</button>`;
        list.appendChild(li);
    });
}

function getUserIdByName(name) {
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    return user ? user.id : null;
}

// Load and Display Borrows
async function loadBorrows() {
    const res = await fetch(BORROW_API);
    const borrows = await res.json();
    const tbody = document.getElementById("borrow-body");
    tbody.innerHTML = "";

    borrows.forEach(borrow => {
        const tr = document.createElement("tr");
        const user = users.find(u => u.id === borrow.user_id);
        const username = user ? user.name : "Unknown User";
        const book = books.find(b => b.id === borrow.book_id);
        const bookname = book ? book.title : "Unknown Book";
        tr.innerHTML = `
            <td>${borrow.id}</td>
            <td>${username}</td>
            <td>${bookname}</td>
            <td>${borrow.borrow_date}</td>
            <td>${borrow.due_date}</td>
            <td>${borrow.status}</td>
            <td><button onclick="deleteBorrow(${borrow.id})">🗑️</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Delete Functions
async function deleteBorrow(id) {
    if (!confirm("Yakin ingin menghapus peminjaman ini?")) return;
    const res = await fetch(`${BORROW_API}/${id}`, { method: "DELETE" });
    const result = await res.json();
    alert(result.message || "Dihapus");
    loadBorrows();
}

async function deleteUser(id) {
    if (!confirm("Yakin hapus user ini?")) return;
    await fetch(`${USER_API}/${id}`, { method: "DELETE" });
    await loadUsers();
}

async function deleteBook(id) {
    if (!confirm("Yakin hapus buku ini?")) return;
    await fetch(`${BOOK_API}/${id}`, { method: "DELETE" });
    await loadBooks();
}

// Add Book
function showBookForm() {
    document.getElementById("add-book-section").style.display = "block";
}

document.getElementById("add-book-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const author = document.getElementById("book-author").value;
    const title = document.getElementById("book-title").value;

    const res = await fetch(BOOK_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, title })
    });

    alert("Buku ditambahkan!");
    document.getElementById("book-author").value = "";
    document.getElementById("book-title").value = "";
    document.getElementById("add-book-section").style.display = "none";
    await loadBooks();
});

// Add User
document.getElementById("add-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name").value;

    const res = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    alert("User berhasil ditambahkan");
    await loadUsers();
});

// Borrow Book
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
    if (res.ok) {
        alert("Peminjaman berhasil ditambahkan!");
        document.getElementById("result").textContent = JSON.stringify(result, null, 2);
    } else {
        alert("Gagal menambahkan peminjaman. Silakan coba lagi.");
    }
});

// Initialize
window.addEventListener("DOMContentLoaded", async () => {
    await loadBooks();
    await loadUsers();
    await loadBorrows();
});