/* रोजचा जमा खर्च अहवाल | APP_VERSION: 1.0.0
   New application foundation. Uses RJKA_v1_* keys only. */
"use strict";

const APP_VERSION = "1.0.0";
const STORAGE_KEYS = Object.freeze({
  transactions: "RJKA_v1_transactions",
  accounts: "RJKA_v1_accounts",
  budgets: "RJKA_v1_budgets",
  lending: "RJKA_v1_lending",
  workplan: "RJKA_v1_workplan",
  settings: "RJKA_v1_settings"
});

const DEFAULT_SETTINGS = Object.freeze({
  currency: "₹",
  firstDayOfWeek: "monday",
  financialYearStartMonth: 4
});

const DEFAULT_ACCOUNTS = Object.freeze([
  { id: "RJKA-ACC-001", name: "UPI", openingBalance: 0, createdAt: new Date().toISOString() },
  { id: "RJKA-ACC-002", name: "Cash", openingBalance: 0, createdAt: new Date().toISOString() },
  { id: "RJKA-ACC-003", name: "Bank", openingBalance: 0, createdAt: new Date().toISOString() }
]);

const MODULES = {
  income: { title: "जमा (Income)", symbol: "＋", description: "उत्पन्नाची नोंद, जमा तारीख, खाते आणि व्यवहारांचा तपशील." },
  expense: { title: "खर्च (Expense)", symbol: "－", description: "खर्चाची नोंद, कॅटेगरी, खाते, तारीख आणि नोंदी." },
  accounts: { title: "खाती (Accounts)", symbol: "▣", description: "UPI, Cash, Bank आणि तुमची इतर खाती व्यवस्थापित करा." },
  budgets: { title: "मासिक बजेट", symbol: "◷", description: "कॅटेगरीनुसार बजेट सेट करून प्रत्यक्ष खर्चाशी तुलना करा." },
  transactions: { title: "व्यवहार", symbol: "⇄", description: "सर्व जमा आणि खर्च व्यवहार शोधा, फिल्टर करा आणि व्यवस्थापित करा." },
  lending: { title: "उधारी", symbol: "⇆", description: "दिलेली किंवा घेतलेली रक्कम, परतफेड आणि बाकी रकमेचा मागोवा घ्या." },
  workplan: { title: "Work Plan", symbol: "☷", description: "दैनिक कामे, वेळ, प्राधान्य आणि पूर्ण झालेल्या कामांची नोंद ठेवा." },
  reports: { title: "अहवाल", symbol: "▤", description: "दैनिक, मासिक, वार्षिक आणि कॅटेगरीनुसार आर्थिक अहवाल." },
  settings: { title: "सेटिंग्ज", symbol: "⚙", description: "चलन, बॅकअप, Restore आणि अ‍ॅपच्या इतर सेटिंग्ज." }
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return structuredCloneSafe(fallback);
    const value = JSON.parse(raw);
    return value ?? structuredCloneSafe(fallback);
  } catch (error) {
    console.error("Storage read error:", key, error);
    return structuredCloneSafe(fallback);
  }
}
function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage write error:", key, error);
    alert("डेटा सेव्ह करता आला नाही. डिव्हाइसवरील स्टोरेज तपासा.");
    return false;
  }
}
function initializeStorage() {
  // Initialize only the new RJKA keys. Existing unrelated keys are untouched.
  if (localStorage.getItem(STORAGE_KEYS.transactions) === null) writeJSON(STORAGE_KEYS.transactions, []);
  if (localStorage.getItem(STORAGE_KEYS.accounts) === null) writeJSON(STORAGE_KEYS.accounts, DEFAULT_ACCOUNTS);
  if (localStorage.getItem(STORAGE_KEYS.budgets) === null) writeJSON(STORAGE_KEYS.budgets, []);
  if (localStorage.getItem(STORAGE_KEYS.lending) === null) writeJSON(STORAGE_KEYS.lending, []);
  if (localStorage.getItem(STORAGE_KEYS.workplan) === null) writeJSON(STORAGE_KEYS.workplan, []);
  if (localStorage.getItem(STORAGE_KEYS.settings) === null) writeJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}
function getData(name) { return readJSON(STORAGE_KEYS[name], []); }
function saveData(name, value) {
  if (!STORAGE_KEYS[name]) throw new Error("Unknown data collection: " + name);
  return writeJSON(STORAGE_KEYS[name], value);
}
function getSettings() { return { ...DEFAULT_SETTINGS, ...readJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS) }; }
function money(value) {
  const currency = getSettings().currency || "₹";
  const amount = Number(value) || 0;
  return currency + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function localISODate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function currentMonth() { return localISODate().slice(0, 7); }
function monthOf(date) { return String(date || "").slice(0, 7); }
function getTransactionAmount(transaction) { return Number(transaction.amount) || 0; }
function accountBalances() {
  const accounts = getData("accounts");
  const transactions = getData("transactions");
  return accounts.map(account => {
    const opening = Number(account.openingBalance) || 0;
    const movement = transactions.reduce((sum, tx) => {
      if (tx.accountId !== account.id) return sum;
      const amount = getTransactionAmount(tx);
      return sum + (tx.type === "income" ? amount : tx.type === "expense" ? -amount : 0);
    }, 0);
    return { ...account, balance: opening + movement };
  });
}
function renderDashboard() {
  const monthInput = document.getElementById("dashboardMonth");
  if (!monthInput.value) monthInput.value = currentMonth();
  const month = monthInput.value;
  const transactions = getData("transactions");
  const monthly = transactions.filter(tx => monthOf(tx.date) === month);
  const income = monthly.filter(tx => tx.type === "income").reduce((s, tx) => s + getTransactionAmount(tx), 0);
  const expense = monthly.filter(tx => tx.type === "expense").reduce((s, tx) => s + getTransactionAmount(tx), 0);
  const balances = accountBalances();
  const balance = balances.reduce((s, a) => s + a.balance, 0);

  document.getElementById("totalBalance").textContent = money(balance);
  document.getElementById("monthIncome").textContent = money(income);
  document.getElementById("monthExpense").textContent = money(expense);
  const netEl = document.getElementById("monthNet");
  netEl.textContent = money(income - expense);
  netEl.className = "summary-value " + (income - expense < 0 ? "negative" : "positive");

  const recent = [...transactions].sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).slice(0,5);
  const recentEl = document.getElementById("recentTransactions");
  recentEl.innerHTML = "";
  if (!recent.length) recentEl.innerHTML = '<div class="empty-state">अद्याप कोणतेही व्यवहार नाहीत.</div>';
  recent.forEach(tx => {
    const isIncome = tx.type === "income";
    const account = balances.find(a => a.id === tx.accountId);
    const row = document.createElement("div");
    row.className = "transaction-row";
    const icon = document.createElement("div"); icon.className = "transaction-icon"; icon.textContent = isIncome ? "＋" : "－";
    const meta = document.createElement("div"); meta.className = "transaction-meta";
    const name = document.createElement("div"); name.className = "transaction-name"; name.textContent = tx.note || tx.category || (isIncome ? "जमा" : "खर्च");
    const detail = document.createElement("div"); detail.className = "transaction-detail"; detail.textContent = `${tx.date || "तारीख नाही"}${account ? " • " + account.name : ""}`;
    meta.append(name, detail);
    const amount = document.createElement("div"); amount.className = "transaction-amount " + (isIncome ? "positive" : "negative"); amount.textContent = (isIncome ? "+" : "−") + money(getTransactionAmount(tx));
    row.append(icon, meta, amount); recentEl.append(row);
  });

  const accountEl = document.getElementById("accountSummary");
  accountEl.innerHTML = "";
  if (!balances.length) accountEl.innerHTML = '<div class="empty-state">खाती उपलब्ध नाहीत.</div>';
  balances.forEach(account => {
    const row = document.createElement("div"); row.className = "account-row";
    const dot = document.createElement("span"); dot.className = "account-dot";
    const name = document.createElement("span"); name.className = "account-name"; name.textContent = account.name;
    const amount = document.createElement("span"); amount.className = "account-balance"; amount.textContent = money(account.balance);
    row.append(dot, name, amount); accountEl.append(row);
  });
}
function showPage(page) {
  // Open completed modules as standalone pages; all pages share the RJKA_v1_* keys.
  const moduleRoutes = Object.freeze({
    income: "income.html",
    expense: "expense.html",
    accounts: "account.html",
    budgets: "budget.html"
  });
  if (moduleRoutes[page]) {
    window.location.href = moduleRoutes[page];
    return;
  }
  const dashboard = page === "dashboard";
  document.getElementById("dashboardPage").classList.toggle("active", dashboard);
  document.getElementById("modulePage").classList.toggle("active", !dashboard);
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  if (!dashboard) {
    const module = MODULES[page] || MODULES.dashboard;
    document.getElementById("moduleTitle").textContent = module.title;
    document.getElementById("moduleHeading").textContent = module.title + " मॉड्यूल";
    document.getElementById("moduleSymbol").textContent = module.symbol;
    document.getElementById("moduleDescription").textContent = module.description;
  }
  closeMenu();
  if (dashboard) renderDashboard();
}
function closeMenu() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("show");
}
function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => showPage(button.dataset.page)));
  document.querySelectorAll("[data-goto]").forEach(button => button.addEventListener("click", () => showPage(button.dataset.goto)));
  document.getElementById("dashboardMonth").addEventListener("change", renderDashboard);
  document.getElementById("refreshBtn").addEventListener("click", renderDashboard);
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebarBackdrop").classList.add("show");
  });
  document.getElementById("sidebarBackdrop").addEventListener("click", closeMenu);
}
function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(err => console.warn("PWA registration:", err)));
  }
}
function startApp() {
  initializeStorage();
  bindEvents();
  renderDashboard();
  registerServiceWorker();
}
document.addEventListener("DOMContentLoaded", startApp);

// Expose a small, intentional API for the next modules and debugging.
window.RJKA = Object.freeze({ APP_VERSION, STORAGE_KEYS, getData, saveData, getSettings, money, accountBalances, renderDashboard });
