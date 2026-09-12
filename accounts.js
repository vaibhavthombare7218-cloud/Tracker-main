/* =========================================================
   accounts.js
   रोजचा जमा खर्च अहवाल
   ACCOUNTS MANAGEMENT

   NEW APP VERSION
   ---------------------------------------------------------
   STORAGE:
   RJKA_v1_accounts
   RJKA_v1_transactions

   BALANCE:
   Opening Balance + Income - Expense

   DEFAULT ACCOUNTS:
   UPI
   Cash
   Bank
========================================================= */

const ACCOUNTS_STORAGE_KEY = "RJKA_v1_accounts";
const TRANSACTIONS_STORAGE_KEY = "RJKA_v1_transactions";


/* =========================================================
   DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNT_LIST = [
    {
        id: "account_upi",
        name: "UPI",
        type: "default",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: "account_cash",
        name: "Cash",
        type: "default",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    },
    {
        id: "account_bank",
        name: "Bank",
        type: "default",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    }
];


/* =========================================================
   STORAGE HELPERS
========================================================= */

function getAccountsStorage() {

    try {

        const data = localStorage.getItem(
            ACCOUNTS_STORAGE_KEY
        );

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Accounts storage read error:",
            error
        );

        return [];
    }
}


function saveAccountsStorage(accounts) {

    localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(accounts)
    );

    window.dispatchEvent(
        new CustomEvent("accountsChanged")
    );
}


/* =========================================================
   TRANSACTION STORAGE
========================================================= */

function getAccountTransactions() {

    try {

        const data = localStorage.getItem(
            TRANSACTIONS_STORAGE_KEY
        );

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Transaction storage read error:",
            error
        );

        return [];
    }
}


/* =========================================================
   GENERATE ID
========================================================= */

function generateAccountId() {

    if (typeof generateId === "function") {
        return generateId("ACC");
    }

    return (
        "ACC-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   NORMALIZE ACCOUNT
========================================================= */

function normalizeAccount(account) {

    return {

        id: String(
            account.id || generateAccountId()
        ),

        name: String(
            account.name || ""
        ).trim(),

        type:
            account.type === "default"
                ? "default"
                : "custom",

        openingBalance:
            Number(account.openingBalance) || 0,

        createdAt:
            account.createdAt ||
            new Date().toISOString(),

        updatedAt:
            account.updatedAt ||
            new Date().toISOString()
    };
}


/* =========================================================
   INITIALIZE ACCOUNTS
========================================================= */

function initializeAccountsStorage() {

    const existing = getAccountsStorage();

    if (existing.length > 0) {
        return existing;
    }

    const defaults =
        DEFAULT_ACCOUNT_LIST.map(
            account => normalizeAccount(account)
        );

    localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(defaults)
    );

    return defaults;
}


/* =========================================================
   GET ALL ACCOUNTS
========================================================= */

function getAllAccounts() {

    return getAccountsStorage()
        .map(normalizeAccount);
}


/* =========================================================
   GET ACCOUNT BY ID
========================================================= */

function getAccountById(accountId) {

    if (!accountId) {
        return null;
    }

    return getAllAccounts()
        .find(
            account =>
                account.id === accountId
        ) || null;
}


/* =========================================================
   ADD ACCOUNT
========================================================= */

function addAccount(data) {

    if (!data) {
        throw new Error(
            "Account data is required."
        );
    }

    const name =
        String(data.name || "").trim();

    if (!name) {
        throw new Error(
            "Account name is required."
        );
    }

    const openingBalance =
        Number(data.openingBalance) || 0;

    const accounts =
        getAllAccounts();

    const duplicate =
        accounts.some(
            account =>
                account.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (duplicate) {

        throw new Error(
            "Account already exists."
        );
    }

    const account = {

        id: generateAccountId(),

        name,

        type: "custom",

        openingBalance,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };

    accounts.push(account);

    saveAccountsStorage(accounts);

    refreshAccountRelatedData();

    return account;
}


/* =========================================================
   UPDATE ACCOUNT
========================================================= */

function updateAccount(accountId, data) {

    if (!accountId) {
        throw new Error(
            "Account ID is required."
        );
    }

    const accounts =
        getAllAccounts();

    const index =
        accounts.findIndex(
            account =>
                account.id === accountId
        );

    if (index === -1) {

        throw new Error(
            "Account not found."
        );
    }

    const current =
        accounts[index];

    const name =
        String(
            data.name !== undefined
                ? data.name
                : current.name
        ).trim();

    if (!name) {

        throw new Error(
            "Account name is required."
        );
    }

    const duplicate =
        accounts.some(
            (account, i) =>
                i !== index &&
                account.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (duplicate) {

        throw new Error(
            "Account already exists."
        );
    }

    const openingBalance =
        data.openingBalance !== undefined
            ? Number(data.openingBalance) || 0
            : current.openingBalance;

    accounts[index] = {

        ...current,

        name,

        openingBalance,

        updatedAt:
            new Date().toISOString()
    };

    saveAccountsStorage(accounts);

    refreshAccountRelatedData();

    return accounts[index];
}


/* =========================================================
   DELETE ACCOUNT
========================================================= */

function deleteAccount(accountId) {

    const account =
        getAccountById(accountId);

    if (!account) {

        throw new Error(
            "Account not found."
        );
    }

    if (account.type === "default") {

        throw new Error(
            "Default accounts cannot be deleted."
        );
    }

    const transactions =
        getAccountTransactions();

    const used =
        transactions.some(
            transaction =>
                transaction.accountId ===
                accountId
        );

    if (used) {

        throw new Error(
            "This account has transactions and cannot be deleted."
        );
    }

    const accounts =
        getAllAccounts()
            .filter(
                item =>
                    item.id !== accountId
            );

    saveAccountsStorage(accounts);

    refreshAccountRelatedData();

    return true;
}


/* =========================================================
   GET ACCOUNT INCOME
========================================================= */

function getAccountIncome(accountId) {

    return getAccountTransactions()
        .filter(
            transaction =>
                transaction.accountId === accountId &&
                transaction.type === "income"
        )
        .reduce(
            (total, transaction) =>
                total +
                (Number(transaction.amount) || 0),
            0
        );
}


/* =========================================================
   GET ACCOUNT EXPENSE
========================================================= */

function getAccountExpense(accountId) {

    return getAccountTransactions()
        .filter(
            transaction =>
                transaction.accountId === accountId &&
                transaction.type === "expense"
        )
        .reduce(
            (total, transaction) =>
                total +
                (Number(transaction.amount) || 0),
            0
        );
}


/* =========================================================
   GET CURRENT BALANCE
========================================================= */

function getAccountCurrentBalance(accountId) {

    const account =
        getAccountById(accountId);

    if (!account) {
        return 0;
    }

    const income =
        getAccountIncome(accountId);

    const expense =
        getAccountExpense(accountId);

    return (
        Number(account.openingBalance || 0) +
        income -
        expense
    );
}


/* =========================================================
   GET ACCOUNT SUMMARY
========================================================= */

function getAccountSummary(accountId) {

    const account =
        getAccountById(accountId);

    if (!account) {
        return null;
    }

    const income =
        getAccountIncome(accountId);

    const expense =
        getAccountExpense(accountId);

    const balance =
        Number(account.openingBalance || 0) +
        income -
        expense;

    return {

        id: account.id,

        name: account.name,

        type: account.type,

        openingBalance:
            Number(account.openingBalance || 0),

        income,

        expense,

        balance
    };
}


/* =========================================================
   GET ALL ACCOUNT SUMMARIES
========================================================= */

function getAllAccountSummaries() {

    return getAllAccounts()
        .map(
            account =>
                getAccountSummary(account.id)
        );
}


/* =========================================================
   TOTAL BALANCE
========================================================= */

function getTotalAccountsBalance() {

    return getAllAccountSummaries()
        .reduce(
            (total, account) =>
                total +
                account.balance,
            0
        );
}


/* =========================================================
   TOTAL OPENING BALANCE
========================================================= */

function getTotalOpeningBalance() {

    return getAllAccounts()
        .reduce(
            (total, account) =>
                total +
                Number(account.openingBalance || 0),
            0
        );
}


/* =========================================================
   TOTAL INCOME
========================================================= */

function getTotalAccountsIncome() {

    return getAllAccountSummaries()
        .reduce(
            (total, account) =>
                total +
                account.income,
            0
        );
}


/* =========================================================
   TOTAL EXPENSE
========================================================= */

function getTotalAccountsExpense() {

    return getAllAccountSummaries()
        .reduce(
            (total, account) =>
                total +
                account.expense,
            0
        );
}


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatAccountAmount(amount) {

    const value =
        Number(amount) || 0;

    if (typeof formatCurrency === "function") {
        return formatCurrency(value);
    }

    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   REFRESH RELATED DATA
========================================================= */

function refreshAccountRelatedData() {

    if (
        typeof renderAccounts === "function"
    ) {
        renderAccounts();
    }

    if (
        typeof updateDashboard === "function"
    ) {
        updateDashboard();
    }
}


/* =========================================================
   GLOBAL API
========================================================= */

window.RJKA_Accounts = {

    storageKey:
        ACCOUNTS_STORAGE_KEY,

    transactionStorageKey:
        TRANSACTIONS_STORAGE_KEY,

    initialize:
        initializeAccountsStorage,

    getAll:
        getAllAccounts,

    getById:
        getAccountById,

    add:
        addAccount,

    update:
        updateAccount,

    remove:
        deleteAccount,

    getIncome:
        getAccountIncome,

    getExpense:
        getAccountExpense,

    getBalance:
        getAccountCurrentBalance,

    getSummary:
        getAccountSummary,

    getAllSummaries:
        getAllAccountSummaries,

    getTotalBalance:
        getTotalAccountsBalance,

    getTotalOpeningBalance:
        getTotalOpeningBalance,

    getTotalIncome:
        getTotalAccountsIncome,

    getTotalExpense:
        getTotalAccountsExpense,

    formatAmount:
        formatAccountAmount
};


/* =========================================================
   INITIALIZE
========================================================= */

initializeAccountsStorage();

console.log(
    "RJKA Accounts system ready."
);
