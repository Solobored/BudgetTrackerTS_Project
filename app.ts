// app.ts - BudgetTrackerTS (browser UI)
// Author: Josue Neiculeo
// Purpose: Budget tracker demonstrating TypeScript, DOM, localStorage, recursion, async, lists, classes, and exception handling.

type TxType = "income" | "expense";

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  notes?: string;
  dateISO: string;
  createdAtISO: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatCLP(n: number): string {
  try {
    return n.toLocaleString("es-CL", { style: "currency", currency: "CLP" });
  } catch {
    return String(n);
  }
}

const STORAGE_KEY = "budgettracker.v1";

function loadTx(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveTx(list: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let state = {
  tx: loadTx(),
  filters: { category: "", from: "", to: "" },
};

const els = {
  form: document.getElementById("txForm") as HTMLFormElement,
  type: document.getElementById("type") as HTMLSelectElement,
  amount: document.getElementById("amount") as HTMLInputElement,
  category: document.getElementById("category") as HTMLInputElement,
  notes: document.getElementById("notes") as HTMLInputElement,
  date: document.getElementById("date") as HTMLInputElement,
  txList: document.getElementById("txList") as HTMLUListElement,
  filterCategory: document.getElementById("filterCategory") as HTMLInputElement,
  filterFrom: document.getElementById("filterFrom") as HTMLInputElement,
  filterTo: document.getElementById("filterTo") as HTMLInputElement,
  applyFilter: document.getElementById("applyFilter") as HTMLButtonElement,
  clearFilter: document.getElementById("clearFilter") as HTMLButtonElement,
  totalIncome: document.getElementById("totalIncome") as HTMLElement,
  totalExpense: document.getElementById("totalExpense") as HTMLElement,
  balance: document.getElementById("balance") as HTMLElement,
};

class Budget {
  private transactions: Transaction[];
  constructor() {
    this.transactions = loadTx();
  }
  all(): Transaction[] {
    return [...this.transactions];
  }
  add(tx: Transaction) {
    this.transactions.unshift(tx);
    saveTx(this.transactions);
  }
  delete(id: string) {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    saveTx(this.transactions);
  }
  update(id: string, patch: Partial<Transaction>) {
    this.transactions = this.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
    saveTx(this.transactions);
  }
}

function sumRecursive(list: number[]): number {
  if (list.length === 0) return 0;
  return list[0] + sumRecursive(list.slice(1));
}

async function fakeApiSave(tx: Transaction): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("(fakeApi) transaction synced:", tx.id);
      resolve(true);
    }, 300);
  });
}

function validateTransactionInput(data: Omit<Transaction, "id" | "createdAtISO">) {
  if (!data.category || data.category.trim() === "") throw new Error("Category is required");
  if (isNaN(data.amount) || data.amount <= 0) throw new Error("Amount must be a positive number");
  if (!/\d{4}-\d{2}-\d{2}/.test(data.dateISO)) throw new Error("Date must be in YYYY-MM-DD format");
}

function filteredTx(): Transaction[] {
  return state.tx.filter((t) => {
    if (state.filters.category && !t.category.toLowerCase().includes(state.filters.category.toLowerCase())) return false;
    if (state.filters.from && t.dateISO < state.filters.from) return false;
    if (state.filters.to && t.dateISO > state.filters.to) return false;
    return true;
  });
}

function renderAll() {
  if (!els.txList) return;
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
    const btnEdit = li.querySelector(".edit") as HTMLButtonElement | null;
    const btnDel = li.querySelector(".del") as HTMLButtonElement | null;
    btnEdit?.addEventListener("click", () => enterEditMode(t.id));
    btnDel?.addEventListener("click", () => deleteTx(t.id));
    els.txList.appendChild(li);
  }

  const incomes = sumRecursive(list.filter((x) => x.type === "income").map((x) => x.amount));
  const expenses = sumRecursive(list.filter((x) => x.type === "expense").map((x) => x.amount));
  els.totalIncome.textContent = formatCLP(incomes);
  els.totalExpense.textContent = formatCLP(expenses);
  els.balance.textContent = formatCLP(incomes - expenses);
}

function addTx(data: Omit<Transaction, "id" | "createdAtISO">) {
  try {
    validateTransactionInput(data);
  } catch (e) {
    throw e;
  }
  const tx: Transaction = { ...data, id: uid(), createdAtISO: new Date().toISOString() };
  state.tx.unshift(tx);
  saveTx(state.tx);
  fakeApiSave(tx).catch((err) => console.error("Sync failed:", err));
  renderAll();
}

function deleteTx(id: string) {
  state.tx = state.tx.filter((t) => t.id !== id);
  saveTx(state.tx);
  renderAll();
}

function updateTx(id: string, patch: Partial<Transaction>) {
  state.tx = state.tx.map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTx(state.tx);
  renderAll();
}

function enterEditMode(id: string) {
  const tx = state.tx.find((t) => t.id === id);
  if (!tx) return;
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

function applyFilters() {
  state.filters.category = (els.filterCategory?.value || "").trim();
  state.filters.from = (els.filterFrom?.value || "");
  state.filters.to = (els.filterTo?.value || "");
  renderAll();
}
function clearFilters() {
  if (els.filterCategory) els.filterCategory.value = "";
  if (els.filterFrom) els.filterFrom.value = "";
  if (els.filterTo) els.filterTo.value = "";
  state.filters = { category: "", from: "", to: "" };
  renderAll();
}

els.form?.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const type = (els.type?.value || "income") as TxType;
  const amount = Number(els.amount?.value || 0);
  const category = (els.category?.value || "").trim();
  const notes = (els.notes?.value || "").trim();
  const dateISO = (els.date?.value || todayISO());
  try {
    addTx({ type, amount, category, notes, dateISO });
    els.form?.reset();
    if (els.date) els.date.value = todayISO();
  } catch (e) {
    alert("Failed to add transaction: " + ((e as Error).message || "Unknown error"));
  }
});

els.applyFilter?.addEventListener("click", applyFilters);
els.clearFilter?.addEventListener("click", clearFilters);

renderAll();

console.log("BudgetTrackerTS loaded. Transactions in memory:", state.tx.length);
console.log("Sample recursive sum of [1,2,3]:", sumRecursive([1, 2, 3]));
