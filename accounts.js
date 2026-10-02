"use strict";

/* =========================================================
RJKA_v1 - ACCOUNT MODULE
Storage Key:
RJKA_v1_accounts
========================================================= */

const K = {
transactions: "RJKA_v1_transactions",
accounts: "RJKA_v1_accounts",
budgets: "RJKA_v1_budgets",
settings: "RJKA_v1_settings"
};

const $ = selector => document.querySelector(selector);

function read(key, fallback = []) {
try {
const value = localStorage.getItem(K[key]);

if (value === null) {
  return fallback;
}

const parsed = JSON.parse(value);

return parsed ?? fallback;

} catch (error) {
console.error("RJKA read error:", key, error);
return fallback;
}
}

function save(key, value) {
localStorage.setItem(K[key], JSON.stringify(value));
}

function esc(value) {
return String(value ?? "").replace(
/[&<>"']/g,
char => ({
"&": "&",
"<": "<",
">": ">",
'"': """,
"'": "'"
}[char])
);
}

function money(value) {

const settings = read("settings", {
currency: "₹"
});

const currency = settings.currency || "₹";

return currency +
Number(value || 0).toLocaleString("en-IN", {
minimumFractionDigits: 2,
maximumFractionDigits: 2
});
}

/* =========================================================
DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNTS = [
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
];

/* =========================================================
ACCOUNT INITIALIZATION
========================================================= */

function getAccounts() {

const stored = localStorage.getItem(K.accounts);

/*
First launch:
Save default accounts directly to RJKA_v1_accounts.
*/

if (stored === null) {

const defaults = DEFAULT_ACCOUNTS.map(account => ({
  ...account
}));

save("accounts", defaults);

return defaults;

}

try {

const parsed = JSON.parse(stored);

if (!Array.isArray(parsed)) {
  save("accounts", []);
  return [];
}

return parsed;

} catch (error) {

console.error("Invalid account data:", error);

save("accounts", []);

return [];

}
}

/* =========================================================
TRANSACTIONS
========================================================= */

function getTransactions() {
return read("transactions", []);
}

/* =========================================================
ACCOUNT BALANCE
========================================================= */

function calculateBalance(account, transactions) {

const opening = Number(account.openingBalance || 0);

const transactionTotal = transactions
.filter(transaction => transaction.accountId === account.id)
.reduce((total, transaction) => {

  const amount = Number(transaction.amount || 0);

  if (transaction.type === "income") {
    return total + amount;
  }

  if (transaction.type === "expense") {
    return total - amount;
  }

  return total;

}, 0);

return opening + transactionTotal;
}

/* =========================================================
ID GENERATOR
========================================================= */

function createId() {

return (
"RJKA-ACC-" +
Date.now().toString(36).toUpperCase() +
"-" +
Math.random().toString(36).slice(2, 7).toUpperCase()
);
}

/* =========================================================
RENDER
========================================================= */

function render() {

const app = $("#app");

if (!app) return;

const accounts = getAccounts();
const transactions = getTransactions();

const accountData = accounts.map(account => {

const accountTransactions =
  transactions.filter(
    transaction => transaction.accountId === account.id
  );

const balance =
  calculateBalance(account, transactions);

return {
  ...account,
  balance,
  transactionCount: accountTransactions.length
};

});

const totalBalance =
accountData.reduce(
(total, account) => total + account.balance,
0
);

app.innerHTML = `

<!-- ADD / EDIT ACCOUNT -->

<section class="panel">

  <div class="panel-heading">

    <div>
      <h2 id="formTitle">नवीन खाते जोडा</h2>
      <p class="muted">
        UPI, Cash, Bank किंवा तुमचे इतर खाते जोडा.
      </p>
    </div>

  </div>

  <form id="accountForm">

    <input
      type="hidden"
      id="editId"
    >

    <div class="form-grid">

      <div class="field">

        <label for="name">
          खात्याचे नाव
        </label>

        <input
          id="name"
          type="text"
          maxlength="50"
          placeholder="उदा. Savings Account"
          required
        >

      </div>


      <div class="field">

        <label for="opening">
          सुरुवातीची शिल्लक (₹)
        </label>

        <input
          id="opening"
          type="number"
          step="0.01"
          value="0"
          required
        >

      </div>


      <div class="form-actions">

        <button
          class="primary-btn"
          type="submit"
        >
          खाते सेव्ह करा
        </button>

        <button
          class="secondary-btn"
          type="button"
          id="cancelEdit"
          hidden
        >
          रद्द करा
        </button>

      </div>

    </div>

  </form>

</section>


<!-- SUMMARY -->

<section class="summary-grid">

  <div class="summary-card">

    <div class="summary-label">
      एकूण खाती
    </div>

    <div class="summary-value">
      ${accountData.length}
    </div>

    <div class="summary-note">
      सध्या उपलब्ध खाती
    </div>

  </div>


  <div class="summary-card">

    <div class="summary-label">
      एकूण उपलब्ध शिल्लक
    </div>

    <div class="summary-value ${
      totalBalance < 0 ? "negative" : "positive"
    }">
      ${money(totalBalance)}
    </div>

    <div class="summary-note">
      सर्व खात्यांची एकत्रित शिल्लक
    </div>

  </div>

</section>


<!-- ACCOUNT LIST -->

<section class="panel">

  <div class="panel-heading">

    <div>
      <h2>खात्यांची यादी</h2>

      <p class="muted">
        प्रत्येक खात्याची सध्याची उपलब्ध शिल्लक.
      </p>
    </div>

  </div>


  ${
    accountData.length
      ? `
        <div class="account-list">

          ${accountData.map(account => `

            <div class="account-row">

              <div class="account-dot"></div>

              <div class="transaction-meta">

                <div class="transaction-name">
                  ${esc(account.name)}
                </div>

                <div class="transaction-detail">

                  सुरुवातीची शिल्लक:
                  ${money(account.openingBalance)}

                  • व्यवहार:
                  ${account.transactionCount}

                </div>

              </div>


              <div class="account-balance ${
                account.balance < 0
                  ? "negative"
                  : "positive"
              }">

                ${money(account.balance)}

              </div>


              <button
                class="text-btn"
                data-edit="${esc(account.id)}"
              >
                Edit
              </button>


              <button
                class="text-btn negative"
                data-delete="${esc(account.id)}"
              >
                Delete
              </button>

            </div>

          `).join("")}

        </div>
      `
      : `
        <div class="empty-state">
          खाते उपलब्ध नाही.
        </div>
      `
  }

</section>


<section class="panel">

  <div class="module-note">

    <b>महत्त्वाचे:</b>

    ज्या खात्याशी व्यवहार जोडलेले आहेत,
    ते खाते Delete करता येणार नाही.

    खाते Delete करण्यापूर्वी त्याचे व्यवहार
    दुसऱ्या खात्यात बदला किंवा हटवा.

  </div>

</section>

`;

bindEvents();

}

/* =========================================================
FORM EVENTS
========================================================= */

function bindEvents() {

const form = $("#accountForm");

if (!form) return;

form.addEventListener("submit", event => {

event.preventDefault();

const accounts = getAccounts();

const editId = $("#editId").value.trim();

const name = $("#name").value.trim();

const openingBalance =
  Number($("#opening").value);


if (!name) {

  alert("कृपया खात्याचे नाव भरा.");

  return;
}


if (!Number.isFinite(openingBalance)) {

  alert("कृपया योग्य सुरुवातीची शिल्लक भरा.");

  return;
}


/*
  Duplicate account name check
*/

const duplicate = accounts.some(account =>
  account.name.trim().toLowerCase() ===
  name.toLowerCase() &&
  account.id !== editId
);


if (duplicate) {

  alert("या नावाचे खाते आधीपासून आहे.");

  return;
}


/*
  EDIT
*/

if (editId) {

  const updated = accounts.map(account => {

    if (account.id !== editId) {
      return account;
    }

    return {
      ...account,
      name,
      openingBalance
    };

  });

  save("accounts", updated);

}


/*
  ADD
*/

else {

  accounts.push({

    id: createId(),

    name,

    openingBalance,

    createdAt:
      new Date().toISOString()

  });

  save("accounts", accounts);

}


resetForm();

render();

});

/*
Cancel Edit
*/

const cancelButton = $("#cancelEdit");

if (cancelButton) {

cancelButton.addEventListener(
  "click",
  resetForm
);

}

/*
Edit buttons
*/

document
.querySelectorAll("[data-edit]")
.forEach(button => {

  button.addEventListener("click", () => {

    const accountId =
      button.dataset.edit;

    startEdit(accountId);

  });

});

/*
Delete buttons
*/

document
.querySelectorAll("[data-delete]")
.forEach(button => {

  button.addEventListener("click", () => {

    deleteAccount(
      button.dataset.delete
    );

  });

});

}

/* =========================================================
START EDIT
========================================================= */

function startEdit(accountId) {

const account =
getAccounts().find(
item => item.id === accountId
);

if (!account) return;

$("#editId").value = account.id;

$("#name").value = account.name;

$("#opening").value =
Number(account.openingBalance || 0);

$("#formTitle").textContent =
"खाते संपादित करा";

$("#cancelEdit").hidden = false;

window.scrollTo({
top: 0,
behavior: "smooth"
});

}

/* =========================================================
RESET FORM
========================================================= */

function resetForm() {

const form = $("#accountForm");

if (!form) return;

form.reset();

$("#editId").value = "";

$("#opening").value = "0";

$("#formTitle").textContent =
"नवीन खाते जोडा";

$("#cancelEdit").hidden = true;

}

/* =========================================================
DELETE ACCOUNT
========================================================= */

function deleteAccount(accountId) {

const transactions =
getTransactions();

const linkedTransactions =
transactions.filter(
transaction =>
transaction.accountId === accountId
);

if (linkedTransactions.length > 0) {

alert(
  "या खात्याशी व्यवहार जोडलेले आहेत.\n\n" +
  "आधी ते व्यवहार दुसऱ्या खात्यात बदला " +
  "किंवा हटवा."
);

return;

}

const account =
getAccounts().find(
item => item.id === accountId
);

if (!account) return;

const confirmed =
confirm(
""${account.name}" खाते हटवायचे आहे का?"
);

if (!confirmed) return;

const updated =
getAccounts().filter(
item => item.id !== accountId
);

save("accounts", updated);

render();

}

/* =========================================================
START APPLICATION
========================================================= */

(function init() {

/*
First launch initialization
*/

getAccounts();

render();

})();
