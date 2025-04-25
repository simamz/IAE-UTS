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
        li.innerHTML = `#${b.id} - "${b.title}" oleh ${b.author} <button onclick="deleteBook(${b.id})">🗑️</button>`;
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
    displayUsers(users); // ⬅️ Tambahan ini
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

document.getElementById("add-user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name").value;

    const res = await fetch(USER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    const result = await res.json();
    alert("User berhasil ditambahkan");
    await loadUsers();
});

function displayUsers(data) {
    const list = document.getElementById("user-list");
    list.innerHTML = "";
    data.forEach(u => {
        const li = document.createElement("li");
        li.innerHTML = `#${u.id} - ${u.name} <button onclick="deleteUser(${u.id})">🗑️</button>`;
        list.appendChild(li);
    });
}



async function loadBorrows() {
    const res = await fetch(BORROW_API);
    const borrows = await res.json();
    const tbody = document.getElementById("borrow-body");
    tbody.innerHTML = "";

    borrows.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${b.id}</td>
        <td>${b.user_id}</td>
        <td>${b.book_id}</td>
        <td>${b.borrow_date}</td>
        <td>${b.due_date}</td>
        <td>${b.status}</td>
        <td><button onclick="deleteBorrow(${b.id})">🗑️</button></td>
      `;
        tbody.appendChild(tr);
    });
}

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

    const data = await res.json();
    alert("Buku ditambahkan!");
    document.getElementById("book-author").value = "";
    document.getElementById("book-title").value = "";
    document.getElementById("add-book-section").style.display = "none";
    await loadBooks();
});


window.addEventListener("DOMContentLoaded", async () => {
    await loadBooks();
    await loadUsers();
});