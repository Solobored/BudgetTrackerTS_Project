// ---------------------- BudgetTrackerTS ----------------------
// Author: Josue Neiculeo
// Purpose: Budget tracker using TypeScript, DOM, localStorage, filters, and totals.

// --- Types ---
type TxType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TxType;
  amount: number; // stored as positive number
  category: string;
  notes?: string;
  dateISO: string; // YYYY-MM-DD
  createdAtISO: string;
}

// --- Utilities ---
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
function formatCLP(n: number): string {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
}

// --- Storage ---
const STORAGE_KEY = 'budgettracker.v1';
function loadTx(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function saveTx(list: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// --- State ---
let state: {
  tx: Transaction[];
  filters: { category: string; from: string; to: string };
} = {
  tx: loadTx(),
  filters: { category: '', from: '', to: '' },
};

// --- DOM Refs (with ! to assert non-null) ---
const els = {
  form: document.getElementById('txForm') as HTMLFormElement,
  type: document.getElementById('type') as HTMLSelectElement,
  amount: document.getElementById('amount') as HTMLInputElement,
  category: document.getElementById('category') as HTMLInputElement,
  notes: document.getElementById('notes') as HTMLInputElement,
  date: document.getElementById('date') as HTMLInputElement,
  txList: document.getElementById('txList') as HTMLUListElement,
  filterCategory: document.getElementById('filterCategory') as HTMLInputElement,
  filterFrom: document.getElementById('filterFrom') as HTMLInputElement,
  filterTo: document.getElementById('filterTo') as HTMLInputElement,
  applyFilter: document.getElementById('applyFilter') as HTMLButtonElement,
  clearFilter: document.getElementById('clearFilter') as HTMLButtonElement,
  totalIncome: document.getElementById('totalIncome') as HTMLElement,
  totalExpense: document.getElementById('totalExpense') as HTMLElement,
  balance: document.getElementById('balance') as HTMLElement,
};

// --- Filtering ---
function filteredTx(): Transaction[] {
  return state.tx.filter((t) => {
    if (state.filters.category && !t.category.toLowerCase().includes(state.filters.category.toLowerCase())) {
      return false;
    }
    if (state.filters.from && t.dateISO < state.filters.from) return false;
    if (state.filters.to && t.dateISO > state.filters.to) return false;
    return true;
  });
}

// --- Rendering ---
function renderAll(): void {
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
    (li.querySelector('.edit') as HTMLButtonElement).addEventListener('click', () => enterEditMode(t.id));
    (li.querySelector('.del') as HTMLButtonElement).addEventListener('click', () => deleteTx(t.id));

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
function addTx(data: Omit<Transaction, 'id' | 'createdAtISO'>): void {
  const tx: Transaction = { ...data, id: uid(), createdAtISO: new Date().toISOString() };
  state.tx.unshift(tx);
  saveTx(state.tx);
  renderAll();
}
function deleteTx(id: string): void {
  state.tx = state.tx.filter((t) => t.id !== id);
  saveTx(state.tx);
  renderAll();
}
function updateTx(id: string, patch: Partial<Transaction>): void {
  state.tx = state.tx.map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTx(state.tx);
  renderAll();
}

// --- Edit Mode ---
function enterEditMode(id: string): void {
  const tx = state.tx.find((t) => t.id === id);
  if (!tx) return;

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
function applyFilters(): void {
  state.filters.category = els.filterCategory.value.trim();
  state.filters.from = els.filterFrom.value;
  state.filters.to = els.filterTo.value;
  renderAll();
}
function clearFilters(): void {
  els.filterCategory.value = '';
  els.filterFrom.value = '';
  els.filterTo.value = '';
  state.filters = { category: '', from: '', to: '' };
  renderAll();
}

// --- Event Listeners ---
els.form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const type = els.type.value as TxType;
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
