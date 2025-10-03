"use strict";
// app.ts - BudgetTrackerTS (browser UI)
// Author: Josue Neiculeo
// Purpose: Budget tracker demonstrating TypeScript features
// Includes: DOM manipulation, localStorage, recursion, async, lists, classes, and exception handling.
var _a, _b, _c;
// --- Utility functions ---
/** Generates a unique string ID */
function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
/** Returns today’s date in YYYY-MM-DD format */
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
/** Format a number as Chilean pesos */
function formatCLP(n) {
    try {
        return n.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
    }
    catch {
        return String(n);
    }
}
// --- Storage helpers ---
const STORAGE_KEY = "budgettracker.v1";
/** Load transactions from localStorage */
function loadTx() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}
/** Save transactions into localStorage */
function saveTx(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
// --- State ---
let state = {
    tx: loadTx(),
    filters: { category: "", from: "", to: "" },
};
// --- DOM References ---
const els = {
    form: document.getElementById("txForm"),
    type: document.getElementById("type"),
    amount: document.getElementById("amount"),
    category: document.getElementById("category"),
    notes: document.getElementById("notes"),
    date: document.getElementById("date"),
    txList: document.getElementById("txList"),
    filterCategory: document.getElementById("filterCategory"),
    filterFrom: document.getElementById("filterFrom"),
    filterTo: document.getElementById("filterTo"),
    applyFilter: document.getElementById("applyFilter"),
    clearFilter: document.getElementById("clearFilter"),
    totalIncome: document.getElementById("totalIncome"),
    totalExpense: document.getElementById("totalExpense"),
    balance: document.getElementById("balance"),
};
// --- Budget Class ---
/**
 * A class that manages transactions.
 * Demonstrates OOP in TypeScript.
 */
class Budget {
    constructor() {
        this.transactions = loadTx();
    }
    all() {
        return [...this.transactions];
    }
    add(tx) {
        this.transactions.unshift(tx);
        saveTx(this.transactions);
    }
    delete(id) {
        this.transactions = this.transactions.filter((t) => t.id !== id);
        saveTx(this.transactions);
    }
    update(id, patch) {
        this.transactions = this.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
        saveTx(this.transactions);
    }
}
// --- Recursion Example ---
/** Recursive sum of a list of numbers */
function sumRecursive(list) {
    if (list.length === 0)
        return 0;
    return list[0] + sumRecursive(list.slice(1));
}
// --- Async Example ---
/** Fake API that simulates saving a transaction */
async function fakeApiSave(tx) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("(fakeApi) transaction synced:", tx.id);
            resolve(true);
        }, 300);
    });
}
// --- Exception Handling ---
/** Validate input fields for a transaction. Throws errors if invalid. */
function validateTransactionInput(data) {
    if (!data.category || data.category.trim() === "")
        throw new Error("Category is required");
    if (isNaN(data.amount) || data.amount <= 0)
        throw new Error("Amount must be a positive number");
    if (!/\d{4}-\d{2}-\d{2}/.test(data.dateISO))
        throw new Error("Date must be in YYYY-MM-DD format");
}
// --- Filtering ---
/** Returns the transactions that match filter criteria */
function filteredTx() {
    return state.tx.filter((t) => {
        if (state.filters.category && !t.category.toLowerCase().includes(state.filters.category.toLowerCase()))
            return false;
        if (state.filters.from && t.dateISO < state.filters.from)
            return false;
        if (state.filters.to && t.dateISO > state.filters.to)
            return false;
        return true;
    });
}
// --- Rendering ---
/** Render all transactions and totals into the DOM */
function renderAll() {
    if (!els.txList)
        return;
    els.txList.innerHTML = "";
    const list = filteredTx();
    for (const t of list) {
        const li = document.createElement("li");
        li.className = "tx";
        li.dataset.id = t.id;
        li.innerHTML = `
      <div class="left">
        <div class="badge">${t.type}</div>
        <div>
          <div class="desc"><strong>${t.category}</strong> <span class="muted">• ${t.notes || ""}</span></div>
          <div class="muted small">${t.dateISO}</div>
        </div>
      </div>
      <div class="right">
        <div class="amount">${formatCLP(t.type === "income" ? t.amount : -t.amount)}</div>
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="del">Delete</button>
        </div>
      </div>
    `;
        const btnEdit = li.querySelector(".edit");
        const btnDel = li.querySelector(".del");
        btnEdit === null || btnEdit === void 0 ? void 0 : btnEdit.addEventListener("click", () => enterEditMode(t.id));
        btnDel === null || btnDel === void 0 ? void 0 : btnDel.addEventListener("click", () => deleteTx(t.id));
        els.txList.appendChild(li);
    }
    // Totals using recursion
    const incomes = sumRecursive(list.filter((x) => x.type === "income").map((x) => x.amount));
    const expenses = sumRecursive(list.filter((x) => x.type === "expense").map((x) => x.amount));
    els.totalIncome.textContent = formatCLP(incomes);
    els.totalExpense.textContent = formatCLP(expenses);
    els.balance.textContent = formatCLP(incomes - expenses);
}
// --- Mutations ---
/** Add a new transaction to state and re-render */
function addTx(data) {
    validateTransactionInput(data);
    const tx = { ...data, id: uid(), createdAtISO: new Date().toISOString() };
    state.tx.unshift(tx);
    saveTx(state.tx);
    fakeApiSave(tx).catch((err) => console.error("Sync failed:", err));
    renderAll();
}
/** Delete a transaction by id */
function deleteTx(id) {
    state.tx = state.tx.filter((t) => t.id !== id);
    saveTx(state.tx);
    renderAll();
}
/** Update a transaction by id */
function updateTx(id, patch) {
    state.tx = state.tx.map((t) => (t.id === id ? { ...t, ...patch } : t));
    saveTx(state.tx);
    renderAll();
}
// --- Edit Mode ---
/** Prompt-based editing for a transaction */
function enterEditMode(id) {
    const tx = state.tx.find((t) => t.id === id);
    if (!tx)
        return;
    const newCategory = prompt("Category", tx.category) || tx.category;
    const newNotes = prompt("Notes", tx.notes || "") || tx.notes;
    const newDate = prompt("Date (YYYY-MM-DD)", tx.dateISO) || tx.dateISO;
    const newAmountStr = prompt("Amount (numeric)", String(tx.amount));
    const newAmount = Number(newAmountStr);
    if (isNaN(newAmount) || newAmount <= 0) {
        alert("Invalid amount");
        return;
    }
    updateTx(id, { category: newCategory, notes: newNotes, dateISO: newDate, amount: newAmount });
}
// --- Filters ---
/** Apply filters and refresh UI */
function applyFilters() {
    var _a, _b, _c;
    state.filters.category = (((_a = els.filterCategory) === null || _a === void 0 ? void 0 : _a.value) || "").trim();
    state.filters.from = (((_b = els.filterFrom) === null || _b === void 0 ? void 0 : _b.value) || "");
    state.filters.to = (((_c = els.filterTo) === null || _c === void 0 ? void 0 : _c.value) || "");
    renderAll();
}
/** Clear filters and refresh UI */
function clearFilters() {
    if (els.filterCategory)
        els.filterCategory.value = "";
    if (els.filterFrom)
        els.filterFrom.value = "";
    if (els.filterTo)
        els.filterTo.value = "";
    state.filters = { category: "", from: "", to: "" };
    renderAll();
}
// --- Wire Events ---
(_a = els.form) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (ev) => {
    var _a, _b, _c, _d, _e, _f;
    ev.preventDefault();
    const type = (((_a = els.type) === null || _a === void 0 ? void 0 : _a.value) || "income");
    const amount = Number(((_b = els.amount) === null || _b === void 0 ? void 0 : _b.value) || 0);
    const category = (((_c = els.category) === null || _c === void 0 ? void 0 : _c.value) || "").trim();
    const notes = (((_d = els.notes) === null || _d === void 0 ? void 0 : _d.value) || "").trim();
    const dateISO = (((_e = els.date) === null || _e === void 0 ? void 0 : _e.value) || todayISO());
    try {
        addTx({ type, amount, category, notes, dateISO });
        (_f = els.form) === null || _f === void 0 ? void 0 : _f.reset();
        if (els.date)
            els.date.value = todayISO();
    }
    catch (e) {
        alert("Failed to add transaction: " + (e.message || "Unknown error"));
    }
});
(_b = els.applyFilter) === null || _b === void 0 ? void 0 : _b.addEventListener("click", applyFilters);
(_c = els.clearFilter) === null || _c === void 0 ? void 0 : _c.addEventListener("click", clearFilters);
// --- Initial Render ---
renderAll();
console.log("BudgetTrackerTS loaded. Transactions in memory:", state.tx.length);
console.log("Sample recursive sum of [1,2,3]:", sumRecursive([1, 2, 3]));
