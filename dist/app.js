"use strict";
// ---------------------- BudgetTrackerTS ----------------------
// Author: Josue Neiculeo
// Purpose: Budget tracker using TypeScript, DOM, localStorage, filters, and totals.
// --- Utilities ---
function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
function formatCLP(n) {
    return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
}
// --- Storage ---
const STORAGE_KEY = 'budgettracker.v1';
function loadTx() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (_a) {
        return [];
    }
}
function saveTx(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
// --- State ---
let state = {
    tx: loadTx(),
    filters: { category: '', from: '', to: '' },
};
// --- DOM Refs (with ! to assert non-null) ---
const els = {
    form: document.getElementById('txForm'),
    type: document.getElementById('type'),
    amount: document.getElementById('amount'),
    category: document.getElementById('category'),
    notes: document.getElementById('notes'),
    date: document.getElementById('date'),
    txList: document.getElementById('txList'),
    filterCategory: document.getElementById('filterCategory'),
    filterFrom: document.getElementById('filterFrom'),
    filterTo: document.getElementById('filterTo'),
    applyFilter: document.getElementById('applyFilter'),
    clearFilter: document.getElementById('clearFilter'),
    totalIncome: document.getElementById('totalIncome'),
    totalExpense: document.getElementById('totalExpense'),
    balance: document.getElementById('balance'),
};
// --- Filtering ---
function filteredTx() {
    return state.tx.filter((t) => {
        if (state.filters.category && !t.category.toLowerCase().includes(state.filters.category.toLowerCase())) {
            return false;
        }
        if (state.filters.from && t.dateISO < state.filters.from)
            return false;
        if (state.filters.to && t.dateISO > state.filters.to)
            return false;
        return true;
    });
}
// --- Rendering ---
function renderAll() {
    els.txList.innerHTML = '';
    const list = filteredTx();
    for (const t of list) {
        const li = document.createElement('li');
        li.className = 'tx';
        li.dataset.id = t.id;
        li.innerHTML = `
      <div class="left">
        <div class="badge ${t.type}">${t.type}</div>
        <div>
          <div class="desc"><strong>${t.category}</strong> <span class="muted">• ${t.notes || ''}</span></div>
          <div class="muted small">${t.dateISO}</div>
        </div>
      </div>
      <div class="right">
        <div class="amount">${formatCLP(t.type === 'income' ? t.amount : -t.amount)}</div>
        <div class="actions">
          <button class="edit">Edit</button>
          <button class="del">Delete</button>
        </div>
      </div>
    `;
        // Events
        li.querySelector('.edit').addEventListener('click', () => enterEditMode(t.id));
        li.querySelector('.del').addEventListener('click', () => deleteTx(t.id));
        els.txList.appendChild(li);
    }
    // Totals
    const incomes = list.filter((x) => x.type === 'income').reduce((s, c) => s + c.amount, 0);
    const expenses = list.filter((x) => x.type === 'expense').reduce((s, c) => s + c.amount, 0);
    els.totalIncome.textContent = formatCLP(incomes);
    els.totalExpense.textContent = formatCLP(expenses);
    els.balance.textContent = formatCLP(incomes - expenses);
}
// --- Mutations ---
function addTx(data) {
    const tx = Object.assign(Object.assign({}, data), { id: uid(), createdAtISO: new Date().toISOString() });
    state.tx.unshift(tx);
    saveTx(state.tx);
    renderAll();
}
function deleteTx(id) {
    state.tx = state.tx.filter((t) => t.id !== id);
    saveTx(state.tx);
    renderAll();
}
function updateTx(id, patch) {
    state.tx = state.tx.map((t) => (t.id === id ? Object.assign(Object.assign({}, t), patch) : t));
    saveTx(state.tx);
    renderAll();
}
// --- Edit Mode ---
function enterEditMode(id) {
    const tx = state.tx.find((t) => t.id === id);
    if (!tx)
        return;
    const newCategory = prompt('Category', tx.category) || tx.category;
    const newNotes = prompt('Notes', tx.notes || '') || tx.notes;
    const newDate = prompt('Date (YYYY-MM-DD)', tx.dateISO) || tx.dateISO;
    const newAmountStr = prompt('Amount (numeric)', String(tx.amount));
    const newAmount = Number(newAmountStr);
    if (isNaN(newAmount) || newAmount <= 0) {
        alert('Invalid amount');
        return;
    }
    updateTx(id, { category: newCategory, notes: newNotes, dateISO: newDate, amount: newAmount });
}
// --- Filters ---
function applyFilters() {
    state.filters.category = els.filterCategory.value.trim();
    state.filters.from = els.filterFrom.value;
    state.filters.to = els.filterTo.value;
    renderAll();
}
function clearFilters() {
    els.filterCategory.value = '';
    els.filterFrom.value = '';
    els.filterTo.value = '';
    state.filters = { category: '', from: '', to: '' };
    renderAll();
}
// --- Event Listeners ---
els.form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const type = els.type.value;
    const amount = Number(els.amount.value);
    const category = els.category.value.trim();
    const notes = els.notes.value.trim();
    const dateISO = els.date.value || todayISO();
    if (!category || isNaN(amount) || amount <= 0) {
        alert('Please enter valid category and amount');
        return;
    }
    addTx({ type, amount, category, notes, dateISO });
    els.form.reset();
    els.date.value = todayISO();
});
els.applyFilter.addEventListener('click', applyFilters);
els.clearFilter.addEventListener('click', clearFilters);
// --- Init ---
renderAll();
