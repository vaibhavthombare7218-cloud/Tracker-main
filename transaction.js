/* =========================================================
   transactions.js
   रोजचा जमा खर्च अहवाल

   CENTRAL TRANSACTION MANAGEMENT
   VERSION: 1.0.0

   STORAGE KEY:
   RJKA_v1_transactions

   CONNECTED WITH:
   - app.js
   - income.js
   - expense.js
   - accounts.js
   - monthly-budget.js
   - reports.js

   IMPORTANT:
   ---------------------------------------------------------
   ONE TRANSACTION = ONE MASTER RECORD

   Income:
   account balance += amount

   Expense:
   account balance -= amount

   Expense category is stored using the central
   EXPENSE_CATEGORIES from app.js.

   NO OLD STORAGE KEYS ARE USED.
========================================================= */


/* =========================================================
   CENTRAL STORAGE KEY
========================================================= */

const TRANSACTIONS_STORAGE_KEY = "RJKA_v1_transactions";


/* =========================================================
   TRANSACTION TYPES
========================================================= */

const TRANSACTION_TYPES = {
    INCOME: "income",
    EXPENSE: "expense"
};


/* =========================================================
   BASIC STORAGE HELPERS
   Uses the new app storage only.
========================================================= */

function getTransactions() {

    try {

        const data = localStorage.getItem(
            TRANSACTIONS_STORAGE_KEY
        );

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {

        console.error(
            "Transactions read error:",
            error
        );

        return [];
    }
}


function saveTransactions(transactions) {

    try {

        localStorage.setItem(
            TRANSACTIONS_STORAGE_KEY,
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {

        console.error(
            "Transactions save error:",
            error
        );

        return false;
    }
}


/* =========================================================
   NORMALIZE TRANSACTION
========================================================= */

function normalizeTransaction(transaction) {

    if (!transaction || typeof transaction !== "object") {
        return null;
    }

    return {

        id: String(
            transaction.id || generateTransactionId()
        ),

        date: transaction.date
            ? String(transaction.date)
            : getDateString(),

        type:
            transaction.type === TRANSACTION_TYPES.EXPENSE
                ? TRANSACTION_TYPES.EXPENSE
                : TRANSACTION_TYPES.INCOME,

        amount: Number(transaction.amount) || 0,

        categoryId:
            transaction.categoryId
                ? String(transaction.categoryId)
                : "",

        accountId:
            transaction.accountId
                ? String(transaction.accountId)
                : "",

        description:
            transaction.description
                ? String(transaction.description)
                : "",

        note:
            transaction.note
                ? String(transaction.note)
                : "",

        createdAt:
            transaction.createdAt
                ? String(transaction.createdAt)
                : new Date().toISOString(),

        updatedAt:
            transaction.updatedAt
                ? String(transaction.updatedAt)
                : ""
    };
}


/* =========================================================
   GENERATE TRANSACTION ID
========================================================= */

function generateTransactionId() {

    return generateId("TXN");
}


/* =========================================================
   GET ALL TRANSACTIONS
========================================================= */

function getAllTransactions() {

    return getTransactions()
        .map(normalizeTransaction)
        .filter(Boolean);
}


/* =========================================================
   GET TRANSACTION BY ID
========================================================= */

function getTransactionById(transactionId) {

    if (!transactionId) {
        return null;
    }

    const transactions = getAllTransactions();

    return transactions.find(
        transaction =>
            transaction.id === String(transactionId)
    ) || null;
}


/* =========================================================
   VALIDATE TRANSACTION
========================================================= */

function validateTransaction(transaction) {

    const errors = [];

    if (!transaction) {

        errors.push(
            "Transaction data is required."
        );

        return errors;
    }


    /* DATE */

    if (!transaction.date) {

        errors.push(
            "Date is required."
        );
    }


    /* TYPE */

    if (
        transaction.type !== TRANSACTION_TYPES.INCOME &&
        transaction.type !== TRANSACTION_TYPES.EXPENSE
    ) {

        errors.push(
            "Invalid transaction type."
        );
    }


    /* AMOUNT */

    const amount = Number(transaction.amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        errors.push(
            "Amount must be greater than zero."
        );
    }


    /* ACCOUNT */

    if (!transaction.accountId) {

        errors.push(
            "Account is required."
        );

    } else {

        const accounts =
            typeof AppData !== "undefined" &&
            typeof AppData.getAccounts === "function"
                ? AppData.getAccounts()
                : [];

        const accountExists = accounts.some(
            account =>
                account.id === transaction.accountId
        );

        if (!accountExists) {

            errors.push(
                "Selected account does not exist."
            );
        }
    }


    /* EXPENSE CATEGORY */

    if (
        transaction.type === TRANSACTION_TYPES.EXPENSE
    ) {

        if (!transaction.categoryId) {

            errors.push(
                "Expense category is required."
            );

        } else {

            const categories =
                typeof EXPENSE_CATEGORIES !== "undefined"
                    ? EXPENSE_CATEGORIES
                    : [];

            const categoryExists =
                categories.some(
                    category =>
                        category.id ===
                        transaction.categoryId
                );

            if (!categoryExists) {

                errors.push(
                    "Invalid expense category."
                );
            }
        }
    }


    return errors;
}


/* =========================================================
   ADD TRANSACTION
========================================================= */

function addTransaction(data) {

    const transaction = normalizeTransaction({

        id: generateTransactionId(),

        date:
            data && data.date
                ? data.date
                : getDateString(),

        type:
            data && data.type
                ? data.type
                : TRANSACTION_TYPES.EXPENSE,

        amount:
            data && data.amount
                ? Number(data.amount)
                : 0,

        categoryId:
            data && data.categoryId
                ? data.categoryId
                : "",

        accountId:
            data && data.accountId
                ? data.accountId
                : "",

        description:
            data && data.description
                ? data.description.trim()
                : "",

        note:
            data && data.note
                ? data.note.trim()
                : "",

        createdAt:
            new Date().toISOString()
    });


    const errors =
        validateTransaction(transaction);


    if (errors.length > 0) {

        return {
            success: false,
            errors: errors,
            transaction: null
        };
    }


    const transactions =
        getAllTransactions();


    transactions.push(transaction);


    const saved =
        saveTransactions(transactions);


    if (!saved) {

        return {
            success: false,
            errors: [
                "Transaction could not be saved."
            ],
            transaction: null
        };
    }


    /* Notify other modules */

    dispatchTransactionEvent(
        "transactionAdded",
        transaction
    );


    return {
        success: true,
        errors: [],
        transaction: transaction
    };
}


/* =========================================================
   UPDATE TRANSACTION
========================================================= */

function updateTransaction(
    transactionId,
    data
) {

    if (!transactionId) {

        return {
            success: false,
            errors: [
                "Transaction ID is required."
            ],
            transaction: null
        };
    }


    const transactions =
        getAllTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                transaction.id ===
                String(transactionId)
        );


    if (index === -1) {

        return {
            success: false,
            errors: [
                "Transaction not found."
            ],
            transaction: null
        };
    }


    const oldTransaction =
        transactions[index];


    const updated =
        normalizeTransaction({

            ...oldTransaction,

            ...data,

            id: oldTransaction.id,

            createdAt:
                oldTransaction.createdAt,

            updatedAt:
                new Date().toISOString()
        });


    const errors =
        validateTransaction(updated);


    if (errors.length > 0) {

        return {
            success: false,
            errors: errors,
            transaction: null
        };
    }


    transactions[index] =
        updated;


    const saved =
        saveTransactions(transactions);


    if (!saved) {

        return {
            success: false,
            errors: [
                "Transaction could not be updated."
            ],
            transaction: null
        };
    }


    dispatchTransactionEvent(
        "transactionUpdated",
        updated
    );


    return {
        success: true,
        errors: [],
        transaction: updated
    };
}


/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(
    transactionId
) {

    if (!transactionId) {

        return {
            success: false,
            errors: [
                "Transaction ID is required."
            ]
        };
    }


    const transactions =
        getAllTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                transaction.id ===
                String(transactionId)
        );


    if (index === -1) {

        return {
            success: false,
            errors: [
                "Transaction not found."
            ]
        };
    }


    const deletedTransaction =
        transactions[index];


    transactions.splice(index, 1);


    const saved =
        saveTransactions(transactions);


    if (!saved) {

        return {
            success: false,
            errors: [
                "Transaction could not be deleted."
            ]
        };
    }


    dispatchTransactionEvent(
        "transactionDeleted",
        deletedTransaction
    );


    return {
        success: true,
        errors: [],
        transaction: deletedTransaction
    };
}


/* =========================================================
   DELETE ALL TRANSACTIONS
   Used only when intentionally resetting transaction data.
========================================================= */

function deleteAllTransactions() {

    const transactions =
        getAllTransactions();


    const saved =
        saveTransactions([]);


    if (!saved) {

        return {
            success: false,
            errors: [
                "Transactions could not be cleared."
            ]
        };
    }


    dispatchTransactionEvent(
        "transactionsCleared",
        transactions
    );


    return {
        success: true,
        errors: [],
        count: transactions.length
    };
}


/* =========================================================
   FILTER BY TYPE
========================================================= */

function getTransactionsByType(
    type
) {

    return getAllTransactions()
        .filter(
            transaction =>
                transaction.type === type
        );
}


/* =========================================================
   GET INCOME TRANSACTIONS
========================================================= */

function getIncomeTransactions() {

    return getTransactionsByType(
        TRANSACTION_TYPES.INCOME
    );
}


/* =========================================================
   GET EXPENSE TRANSACTIONS
========================================================= */

function getExpenseTransactions() {

    return getTransactionsByType(
        TRANSACTION_TYPES.EXPENSE
    );
}


/* =========================================================
   FILTER BY DATE
========================================================= */

function getTransactionsByDate(
    date
) {

    if (!date) {
        return [];
    }

    return getAllTransactions()
        .filter(
            transaction =>
                transaction.date === String(date)
        );
}


/* =========================================================
   FILTER BY MONTH
   Format: YYYY-MM
========================================================= */

function getTransactionsByMonth(
    month
) {

    if (!month) {
        return [];
    }

    return getAllTransactions()
        .filter(
            transaction =>
                String(transaction.date)
                    .substring(0, 7) ===
                String(month)
        );
}


/* =========================================================
   FILTER BY ACCOUNT
========================================================= */

function getTransactionsByAccount(
    accountId
) {

    if (!accountId) {
        return [];
    }

    return getAllTransactions()
        .filter(
            transaction =>
                transaction.accountId ===
                String(accountId)
        );
}


/* =========================================================
   FILTER BY CATEGORY
========================================================= */

function getTransactionsByCategory(
    categoryId
) {

    if (!categoryId) {
        return [];
    }

    return getAllTransactions()
        .filter(
            transaction =>
                transaction.categoryId ===
                String(categoryId)
        );
}


/* =========================================================
   GET DAILY TRANSACTIONS
========================================================= */

function getTodayTransactions() {

    return getTransactionsByDate(
        getDateString()
    );
}


/* =========================================================
   GET CURRENT MONTH TRANSACTIONS
========================================================= */

function getCurrentMonthTransactions() {

    return getTransactionsByMonth(
        getMonthString()
    );
}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateTransactionTotal(
    transactions
) {

    if (!Array.isArray(transactions)) {
        return 0;
    }

    return transactions.reduce(
        (total, transaction) => {

            const amount =
                Number(transaction.amount);

            return total +
                (
                    Number.isFinite(amount)
                        ? amount
                        : 0
                );

        },
        0
    );
}


/* =========================================================
   TOTAL INCOME
========================================================= */

function getTotalIncome(
    transactions
) {

    const list =
        Array.isArray(transactions)
            ? transactions
            : getIncomeTransactions();


    return calculateTransactionTotal(
        list.filter(
            transaction =>
                transaction.type ===
                TRANSACTION_TYPES.INCOME
        )
    );
}


/* =========================================================
   TOTAL EXPENSE
========================================================= */

function getTotalExpense(
    transactions
) {

    const list =
        Array.isArray(transactions)
            ? transactions
            : getExpenseTransactions();


    return calculateTransactionTotal(
        list.filter(
            transaction =>
                transaction.type ===
                TRANSACTION_TYPES.EXPENSE
        )
    );
}


/* =========================================================
   NET BALANCE
========================================================= */

function getTransactionNetBalance(
    transactions
) {

    const list =
        Array.isArray(transactions)
            ? transactions
            : getAllTransactions();


    const income =
        getTotalIncome(list);


    const expense =
        getTotalExpense(list);


    return income - expense;
}


/* =========================================================
   DAILY TOTALS
========================================================= */

function getTodayTotals() {

    const transactions =
        getTodayTransactions();


    const income =
        getTotalIncome(transactions);


    const expense =
        getTotalExpense(transactions);


    return {

        income: income,

        expense: expense,

        balance:
            income - expense
    };
}


/* =========================================================
   MONTHLY TOTALS
========================================================= */

function getCurrentMonthTotals() {

    const transactions =
        getCurrentMonthTransactions();


    const income =
        getTotalIncome(transactions);


    const expense =
        getTotalExpense(transactions);


    return {

        income: income,

        expense: expense,

        balance:
            income - expense
    };
}


/* =========================================================
   ACCOUNT TRANSACTION TOTALS
========================================================= */

function getAccountTransactionTotals(
    accountId
) {

    const transactions =
        getTransactionsByAccount(
            accountId
        );


    const income =
        getTotalIncome(transactions);


    const expense =
        getTotalExpense(transactions);


    return {

        income: income,

        expense: expense,

        net:
            income - expense,

        transactionCount:
            transactions.length
    };
}


/* =========================================================
   CATEGORY MONTHLY EXPENSE
========================================================= */

function getCategoryMonthlyExpense(
    categoryId,
    month
) {

    const transactions =
        getTransactionsByMonth(
            month
        );


    return getTotalExpense(
        transactions.filter(
            transaction =>
                transaction.categoryId ===
                String(categoryId)
        )
    );
}


/* =========================================================
   CATEGORY MONTHLY TRANSACTIONS
========================================================= */

function getCategoryMonthlyTransactions(
    categoryId,
    month
) {

    return getTransactionsByMonth(
        month
    ).filter(
        transaction =>
            transaction.type ===
                TRANSACTION_TYPES.EXPENSE &&
            transaction.categoryId ===
                String(categoryId)
    );
}


/* =========================================================
   SORT TRANSACTIONS
   Latest first.
========================================================= */

function sortTransactionsLatestFirst(
    transactions
) {

    if (!Array.isArray(transactions)) {
        return [];
    }

    return [...transactions].sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.createdAt ||
                    a.date ||
                    0
                ).getTime();


            const dateB =
                new Date(
                    b.createdAt ||
                    b.date ||
                    0
                ).getTime();


            return dateB - dateA;
        }
    );
}


/* =========================================================
   GET LATEST TRANSACTIONS
========================================================= */

function getLatestTransactions(
    limit = 10
) {

    const transactions =
        sortTransactionsLatestFirst(
            getAllTransactions()
        );


    return transactions.slice(
        0,
        Math.max(0, Number(limit) || 10)
    );
}


/* =========================================================
   SEARCH TRANSACTIONS
========================================================= */

function searchTransactions(
    searchText
) {

    const search =
        String(searchText || "")
            .trim()
            .toLowerCase();


    if (!search) {
        return getAllTransactions();
    }


    return getAllTransactions()
        .filter(transaction => {

            return (

                String(
                    transaction.description || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    transaction.note || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    transaction.date || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    transaction.amount || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    transaction.categoryId || ""
                )
                    .toLowerCase()
                    .includes(search)

                ||

                String(
                    transaction.accountId || ""
                )
                    .toLowerCase()
                    .includes(search)
            );
        });
}


/* =========================================================
   GET ACCOUNT NAME
========================================================= */

function getTransactionAccountName(
    accountId
) {

    if (!accountId) {
        return "";
    }


    if (
        typeof AppData !== "undefined" &&
        typeof AppData.getAccounts ===
            "function"
    ) {

        const accounts =
            AppData.getAccounts();


        const account =
            accounts.find(
                item =>
                    item.id ===
                    String(accountId)
            );


        return account
            ? account.name
            : "";
    }


    return "";
}


/* =========================================================
   GET CATEGORY NAME
========================================================= */

function getTransactionCategoryName(
    categoryId
) {

    if (!categoryId) {
        return "";
    }


    const categories =
        typeof EXPENSE_CATEGORIES !==
            "undefined"
            ? EXPENSE_CATEGORIES
            : [];


    const category =
        categories.find(
            item =>
                item.id ===
                String(categoryId)
        );


    return category
        ? category.name
        : "";
}


/* =========================================================
   PREPARE TRANSACTION FOR DISPLAY
========================================================= */

function getTransactionDisplayData(
    transaction
) {

    if (!transaction) {
        return null;
    }


    return {

        id: transaction.id,

        date: transaction.date,

        type: transaction.type,

        amount: Number(
            transaction.amount
        ) || 0,

        categoryId:
            transaction.categoryId || "",

        categoryName:
            getTransactionCategoryName(
                transaction.categoryId
            ),

        accountId:
            transaction.accountId || "",

        accountName:
            getTransactionAccountName(
                transaction.accountId
            ),

        description:
            transaction.description || "",

        note:
            transaction.note || "",

        createdAt:
            transaction.createdAt || "",

        updatedAt:
            transaction.updatedAt || ""
    };
}


/* =========================================================
   EXPORT TRANSACTIONS DATA
   Returns JSON-ready data.
========================================================= */

function exportTransactionsData() {

    return getAllTransactions()
        .map(transaction =>
            getTransactionDisplayData(
                transaction
            )
        );
}


/* =========================================================
   IMPORT TRANSACTIONS DATA
   IMPORTANT:
   - Uses ONLY RJKA_v1_transactions.
   - Existing transactions are preserved.
   - Duplicate IDs are skipped.
========================================================= */

function importTransactionsData(
    importedData
) {

    if (!Array.isArray(importedData)) {

        return {
            success: false,
            imported: 0,
            skipped: 0,
            errors: [
                "Imported transaction data must be an array."
            ]
        };
    }


    const existing =
        getAllTransactions();


    const existingIds =
        new Set(
            existing.map(
                transaction =>
                    transaction.id
            )
        );


    let imported = 0;

    let skipped = 0;

    const errors = [];


    importedData.forEach(
        (item, index) => {

            const transaction =
                normalizeTransaction(
                    item
                );


            if (!transaction) {

                skipped++;

                errors.push(
                    `Row ${index + 1}: Invalid transaction data.`
                );

                return;
            }


            if (
                existingIds.has(
                    transaction.id
                )
            ) {

                skipped++;

                return;
            }


            const validationErrors =
                validateTransaction(
                    transaction
                );


            if (
                validationErrors.length > 0
            ) {

                skipped++;

                errors.push(
                    `Row ${index + 1}: ${
                        validationErrors.join(", ")
                    }`
                );

                return;
            }


            existing.push(
                transaction
            );


            existingIds.add(
                transaction.id
            );


            imported++;
        }
    );


    const saved =
        saveTransactions(
            existing
        );


    if (!saved) {

        return {
            success: false,
            imported: 0,
            skipped: skipped,
            errors: [
                "Imported transactions could not be saved."
            ]
        };
    }


    dispatchTransactionEvent(
        "transactionsImported",
        {
            imported: imported,
            skipped: skipped
        }
    );


    return {

        success: true,

        imported: imported,

        skipped: skipped,

        errors: errors
    };
}


/* =========================================================
   TRANSACTION EVENT SYSTEM
   Helps Dashboard / Reports / Budget refresh
   after transaction changes.
========================================================= */

function dispatchTransactionEvent(
    eventName,
    detail
) {

    try {

        window.dispatchEvent(
            new CustomEvent(
                eventName,
                {
                    detail: detail
                }
            )
        );

        /* General event */

        window.dispatchEvent(
            new CustomEvent(
                "transactionsChanged",
                {
                    detail: {
                        event:
                            eventName,

                        transaction:
                            detail
                    }
                }
            )
        );

    } catch (error) {

        console.warn(
            "Transaction event error:",
            error
        );
    }
}


/* =========================================================
   AUTOMATIC DASHBOARD REFRESH
   If app.js dashboard function exists.
========================================================= */

function refreshTransactionDependentModules() {

    try {

        if (
            typeof updateDashboard ===
            "function"
        ) {

            updateDashboard();
        }

    } catch (error) {

        console.warn(
            "Dashboard refresh error:",
            error
        );
    }


    try {

        if (
            typeof renderAccounts ===
            "function"
        ) {

            renderAccounts();
        }

    } catch (error) {

        console.warn(
            "Accounts refresh error:",
            error
        );
    }
}


/* =========================================================
   LISTEN FOR TRANSACTION CHANGES
========================================================= */

window.addEventListener(
    "transactionsChanged",
    function () {

        refreshTransactionDependentModules();

    }
);


/* =========================================================
   TRANSACTION SUMMARY
========================================================= */

function getTransactionSummary() {

    const transactions =
        getAllTransactions();


    const incomeTransactions =
        transactions.filter(
            transaction =>
                transaction.type ===
                TRANSACTION_TYPES.INCOME
        );


    const expenseTransactions =
        transactions.filter(
            transaction =>
                transaction.type ===
                TRANSACTION_TYPES.EXPENSE
        );


    const income =
        calculateTransactionTotal(
            incomeTransactions
        );


    const expense =
        calculateTransactionTotal(
            expenseTransactions
        );


    return {

        totalTransactions:
            transactions.length,

        incomeTransactions:
            incomeTransactions.length,

        expenseTransactions:
            expenseTransactions.length,

        totalIncome:
            income,

        totalExpense:
            expense,

        netBalance:
            income - expense
    };
}


/* =========================================================
   SAFE AMOUNT FORMAT
========================================================= */

function formatTransactionAmount(
    amount
) {

    const value =
        Number(amount) || 0;


    if (
        typeof formatCurrency ===
        "function"
    ) {

        return formatCurrency(
            value
        );
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
   TRANSACTION TYPE LABEL
========================================================= */

function getTransactionTypeLabel(
    type
) {

    if (
        type ===
        TRANSACTION_TYPES.INCOME
    ) {

        return "जमा";
    }


    if (
        type ===
        TRANSACTION_TYPES.EXPENSE
    ) {

        return "खर्च";
    }


    return "";
}


/* =========================================================
   TRANSACTION TYPE CLASS
========================================================= */

function getTransactionTypeClass(
    type
) {

    if (
        type ===
        TRANSACTION_TYPES.INCOME
    ) {

        return "income";
    }


    if (
        type ===
        TRANSACTION_TYPES.EXPENSE
    ) {

        return "expense";
    }


    return "";
}


/* =========================================================
   TRANSACTION ROW HTML
   Can be used by transactions page later.
========================================================= */

function createTransactionRowHTML(
    transaction
) {

    if (!transaction) {
        return "";
    }


    const display =
        getTransactionDisplayData(
            transaction
        );


    const typeClass =
        getTransactionTypeClass(
            transaction.type
        );


    const typeLabel =
        getTransactionTypeLabel(
            transaction.type
        );


    const amount =
        formatTransactionAmount(
            transaction.amount
        );


    const description =
        escapeHtml(
            display.description ||
            display.categoryName ||
            typeLabel
        );


    const accountName =
        escapeHtml(
            display.accountName ||
            ""
        );


    const date =
        escapeHtml(
            display.date ||
            ""
        );


    return `
        <div class="transaction-row ${typeClass}"
             data-transaction-id="${escapeHtml(transaction.id)}">

            <div class="transaction-main">

                <div class="transaction-title">
                    ${description}
                </div>

                <div class="transaction-meta">
                    ${date}
                    ${accountName
                        ? ` • ${accountName}`
                        : ""}
                </div>

            </div>

            <div class="transaction-amount ${typeClass}">
                ${typeClass === "income" ? "+" : "-"}
                ${amount}
            </div>

        </div>
    `;
}


/* =========================================================
   DEBUG / INFORMATION
========================================================= */

function getTransactionsStorageInfo() {

    const transactions =
        getAllTransactions();


    return {

        storageKey:
            TRANSACTIONS_STORAGE_KEY,

        count:
            transactions.length,

        summary:
            getTransactionSummary()
    };
}


/* =========================================================
   INITIALIZE TRANSACTION STORAGE
   Does NOT touch old keys.
========================================================= */

function initializeTransactions() {

    const existing =
        localStorage.getItem(
            TRANSACTIONS_STORAGE_KEY
        );


    if (existing === null) {

        localStorage.setItem(
            TRANSACTIONS_STORAGE_KEY,
            JSON.stringify([])
        );
    }
}


/* =========================================================
   START
========================================================= */

initializeTransactions();


/* =========================================================
   GLOBAL API
   Makes the transaction system easy for other files.
========================================================= */

window.RJKA_Transactions = {

    storageKey:
        TRANSACTIONS_STORAGE_KEY,

    getAll:
        getAllTransactions,

    getById:
        getTransactionById,

    add:
        addTransaction,

    update:
        updateTransaction,

    remove:
        deleteTransaction,

    removeAll:
        deleteAllTransactions,

    getByType:
        getTransactionsByType,

    getIncome:
        getIncomeTransactions,

    getExpense:
        getExpenseTransactions,

    getByDate:
        getTransactionsByDate,

    getByMonth:
        getTransactionsByMonth,

    getByAccount:
        getTransactionsByAccount,

    getByCategory:
        getTransactionsByCategory,

    getToday:
        getTodayTransactions,

    getCurrentMonth:
        getCurrentMonthTransactions,

    getTodayTotals:
        getTodayTotals,

    getCurrentMonthTotals:
        getCurrentMonthTotals,

    getAccountTotals:
        getAccountTransactionTotals,

    getCategoryMonthlyExpense:
        getCategoryMonthlyExpense,

    getCategoryMonthlyTransactions:
        getCategoryMonthlyTransactions,

    getLatest:
        getLatestTransactions,

    search:
        searchTransactions,

    getSummary:
        getTransactionSummary,

    export:
        exportTransactionsData,

    import:
        importTransactionsData,

    validate:
        validateTransaction,

    formatAmount:
        formatTransactionAmount
};


/* =========================================================
   END OF transactions.js
========================================================= */
