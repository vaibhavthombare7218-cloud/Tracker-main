/* रोजचा जमा खर्च अहवाल | APP_VERSION: 1.0.0
   RJKA_v1 keys only.
*/
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
  {
    id: "RJKA-ACC-001",
    name: "UPI",
    openingBalance: 0,
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "RJKA-ACC-002",
    name: "Cash",
    openingBalance: 0,
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "RJKA-ACC-003",
    name: "Bank",
    openingBalance: 0,
    createdAt: "2026-01-01T00:00:00.000Z"
  }
]);

const MODULES = {
  income: {
    title: "जमा (Income)",
    symbol: "＋",
    description: "उत्पन्नाची नोंद, जमा तारीख, खाते आणि व्यवहारांचा तपशील."
  },
  expense: {
    title: "खर्च (Expense)",
    symbol: "－",
    description: "खर्चाची नोंद, कॅटेगरी, खाते, तारीख आणि नोंदी."
  },
  accounts: {
    title: "खाती (Accounts)",
    symbol: "▣",
    description: "UPI, Cash, Bank आणि तुमची इतर खाती व्यवस्थापित करा."
  },
  budgets: {
    title: "मासिक बजेट",
    symbol: "◷",
    description: "कॅटेगरीनुसार बजेट आणि प्रत्यक्ष खर्चाची तुलना करा."
  },
  transactions: {
    title: "व्यवहार",
    symbol: "⇄",
    description: "सर्व जमा आणि खर्च व्यवहार पाहा."
  },
  lending: {
    title: "उधारी",
    symbol: "⇆",
    description: "दिलेली किंवा घेतलेली रक्कम आणि परतफेडीचा मागोवा घ्या."
  },
  workplan: {
    title: "Work Plan",
    symbol: "☷",
    description: "दैनिक कामे, वेळ आणि प्राधान्य व्यवस्थापित करा."
  },
  reports: {
    title: "अहवाल",
    symbol: "▤",
    description: "दैनिक, मासिक आणि वार्षिक आर्थिक अहवाल."
  },
  settings: {
    title: "सेटिंग्ज",
    symbol: "⚙",
    description: "चलन, बॅकअप आणि अ‍ॅपच्या सेटिंग्ज."
  }
};

/* =========================================================
   STORAGE HELPERS
========================================================= */

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return structuredCloneSafe(fallback);
    }

    const value = JSON.parse(raw);

    return value ?? structuredCloneSafe(fallback);
  } catch (error) {
    console.error("Storage read error:", key, error);
    return structuredCloneSafe(fallback);
  }
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
  if (localStorage.getItem(STORAGE_KEYS.transactions) === null) {
    writeJSON(STORAGE_KEYS.transactions, []);
  }

  if (localStorage.getItem(STORAGE_KEYS.accounts) === null) {
    writeJSON(STORAGE_KEYS.accounts, structuredCloneSafe(DEFAULT_ACCOUNTS));
  }

  if (localStorage.getItem(STORAGE_KEYS.budgets) === null) {
    writeJSON(STORAGE_KEYS.budgets, []);
  }

  if (localStorage.getItem(STORAGE_KEYS.lending) === null) {
    writeJSON(STORAGE_KEYS.lending, []);
  }

  if (localStorage.getItem(STORAGE_KEYS.workplan) === null) {
    writeJSON(STORAGE_KEYS.workplan, []);
  }

  if (localStorage.getItem(STORAGE_KEYS.settings) === null) {
    writeJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }
}

function getData(name) {
  const key = STORAGE_KEYS[name];

  if (!key) {
    throw new Error("Unknown data collection: " + name);
  }

  const fallback =
    name === "settings" ? DEFAULT_SETTINGS :
    name === "accounts" ? DEFAULT_ACCOUNTS : [];

  return readJSON(key, fallback);
}

function saveData(name, value) {
  const key = STORAGE_KEYS[name];

  if (!key) {
    throw new Error("Unknown data collection: " + name);
  }

  return writeJSON(key, value);
}

function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...readJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  };
}

function money(value) {
  const currency = getSettings().currency || "₹";
  const amount = Number(value) || 0;

  return currency + amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function localISODate(date = new Date()) {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

function currentMonth() {
  return localISODate().slice(0, 7);
}

function monthOf(date) {
  return String(date || "").slice(0, 7);
}

function getTransactionAmount(transaction) {
  return Number(transaction.amount) || 0;
}

/* =========================================================
   ACCOUNT BALANCES
========================================================= */

function accountBalances() {
  const accounts = getData("accounts");
  const transactions = getData("transactions");

  if (!Array.isArray(accounts) || !Array.isArray(transactions)) {
    return [];
  }

  return accounts.map(account => {
    const opening = Number(account.openingBalance) || 0;

    const movement = transactions.reduce((sum, tx) => {
      if (tx.accountId !== account.id) {
        return sum;
      }

      const amount = getTransactionAmount(tx);

      if (tx.type === "income") return sum + amount;
      if (tx.type === "expense") return sum - amount;

      return sum;
    }, 0);

    return {
      ...account,
      balance: opening + movement
    };
  });
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const monthInput = document.getElementById("dashboardMonth");
  const totalBalanceEl = document.getElementById("totalBalance");
  const monthIncomeEl = document.getElementById("monthIncome");
  const monthExpenseEl = document.getElementById("monthExpense");
  const monthNetEl = document.getElementById("monthNet");
  const recentEl = document.getElementById("recentTransactions");
  const accountEl = document.getElementById("accountSummary");

  if (
    !monthInput ||
    !totalBalanceEl ||
    !monthIncomeEl ||
    !monthExpenseEl ||
    !monthNetEl ||
    !recentEl ||
    !accountEl
  ) {
    return;
  }

  if (!monthInput.value) {
    monthInput.value = currentMonth();
  }

  const month = monthInput.value;
  const storedTransactions = getData("transactions");
  const transactions = Array.isArray(storedTransactions)
    ? storedTransactions
    : [];

  const monthly = transactions.filter(
    tx => monthOf(tx.date) === month
  );

  const income = monthly
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + getTransactionAmount(tx), 0);

  const expense = monthly
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + getTransactionAmount(tx), 0);

  const balances = accountBalances();

  const balance = balances.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  totalBalanceEl.textContent = money(balance);
  monthIncomeEl.textContent = money(income);
  monthExpenseEl.textContent = money(expense);
  monthNetEl.textContent = money(income - expense);

  monthNetEl.className =
    "summary-value " +
    (income - expense < 0 ? "negative" : "positive");

  const recent = [...transactions]
    .sort((a, b) =>
      String(b.date || "").localeCompare(String(a.date || "")) ||
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    )
    .slice(0, 5);

  recentEl.replaceChildren();

  if (recent.length === 0) {
    recentEl.innerHTML =
      '<div class="empty-state">अद्याप कोणतेही व्यवहार नाहीत.</div>';
  }

  recent.forEach(tx => {
    const isIncome = tx.type === "income";
    const account = balances.find(a => a.id === tx.accountId);

    const row = document.createElement("div");
    row.className = "transaction-row";

    const icon = document.createElement("div");
    icon.className = "transaction-icon";
    icon.textContent = isIncome ? "＋" : "－";

    const meta = document.createElement("div");
    meta.className = "transaction-meta";

    const name = document.createElement("div");
    name.className = "transaction-name";
    name.textContent =
      tx.note || tx.category || (isIncome ? "जमा" : "खर्च");

    const detail = document.createElement("div");
    detail.className = "transaction-detail";
    detail.textContent =
      `${tx.date || "तारीख नाही"}${account ? " • " + account.name : ""}`;

    meta.append(name, detail);

    const amount = document.createElement("div");
    amount.className =
      "transaction-amount " + (isIncome ? "positive" : "negative");

    amount.textContent =
      (isIncome ? "+" : "−") + money(getTransactionAmount(tx));

    row.append(icon, meta, amount);
    recentEl.append(row);
  });

  accountEl.replaceChildren();

  if (balances.length === 0) {
    accountEl.innerHTML =
      '<div class="empty-state">खाती उपलब्ध नाहीत.</div>';
  }

  balances.forEach(account => {
    const row = document.createElement("div");
    row.className = "account-row";

    const dot = document.createElement("span");
    dot.className = "account-dot";

    const name = document.createElement("span");
    name.className = "account-name";
    name.textContent = account.name;

    const amount = document.createElement("span");
    amount.className = "account-balance";
    amount.textContent = money(account.balance);

    row.append(dot, name, amount);
    accountEl.append(row);
  });
}

/* =========================================================
   MODULE ROUTES
========================================================= */

const moduleRoutes = Object.freeze({
  income: "income.html",
  expense: "expense.html",
  accounts: "account.html",
  transactions: "transactions.html",
  budgets: "budget.html",
  reports: "reports.html"
});


/* =========================================================
   SHOW PAGE - FIXED
========================================================= */

function showPage(page) {
  if (page === "dashboard") {
    document.getElementById("dashboardPage")
      ?.classList.add("active");

    document.getElementById("modulePage")
      ?.classList.remove("active");

    document.querySelectorAll(".nav-item").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === "dashboard"
      );
    });

    closeMenu();
    renderDashboard();
    return;
  }

  if (moduleRoutes[page]) {
    const target = new URL(
      moduleRoutes[page],
      window.location.href
    );

    window.location.href = target.href;
    return;
  }

  const module = MODULES[page];

  if (!module) {
    console.warn("Unknown module:", page);
    return;
  }

  document.getElementById("dashboardPage")
    ?.classList.remove("active");

  document.getElementById("modulePage")
    ?.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  const title = document.getElementById("moduleTitle");
  const heading = document.getElementById("moduleHeading");
  const symbol = document.getElementById("moduleSymbol");
  const description = document.getElementById("moduleDescription");

  if (title) title.textContent = module.title;
  if (heading) heading.textContent = module.title + " मॉड्यूल";
  if (symbol) symbol.textContent = module.symbol;
  if (description) description.textContent = module.description;

  closeMenu();
}

/* =========================================================
   MENU
========================================================= */

function closeMenu() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarBackdrop")?.classList.remove("show");
}

/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.goto);
    });
  });

  document.getElementById("dashboardMonth")
    ?.addEventListener("change", renderDashboard);

  document.getElementById("refreshBtn")
    ?.addEventListener("click", renderDashboard);

  document.getElementById("menuToggle")
    ?.addEventListener("click", () => {
      document.getElementById("sidebar")?.classList.add("open");
      document.getElementById("sidebarBackdrop")?.classList.add("show");
    });

  document.getElementById("sidebarBackdrop")
    ?.addEventListener("click", closeMenu);
}

/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")
        .catch(error => {
          console.warn("PWA registration:", error);
        });
    });
  }
}

/* =========================================================
   START APPLICATION
========================================================= */

function startApp() {
  initializeStorage();
  bindEvents();
  renderDashboard();
  registerServiceWorker();
}

document.addEventListener("DOMContentLoaded", startApp);

/* =========================================================
   PUBLIC API
========================================================= */

window.RJKA = Object.freeze({
  APP_VERSION,
  STORAGE_KEYS,
  getData,
  saveData,
  getSettings,
  money,
  accountBalances,
  renderDashboard,
  showPage
});
