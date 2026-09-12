/* =========================================================
   expense.js
   रोजचा जमा खर्च अहवाल

   EXPENSE MANAGEMENT
   CENTRAL TRANSACTION SYSTEM

   STORAGE:
   RJKA_v1_transactions

   IMPORTANT:
   - No separate expense storage
   - All expenses are stored in central transactions
========================================================= */

const EXPENSE_TRANSACTION_TYPE = "expense";

const EXPENSE_STORAGE_KEY = "RJKA_v1_transactions";


/* =========================================================
   CHECK TRANSACTION SYSTEM
========================================================= */

function expenseTransactionSystemAvailable() {

    return (
        typeof window.RJKA_Transactions !== "undefined" &&
        typeof window.RJKA_Transactions.getAll === "function"
    );

}


/* =========================================================
   GET ALL EXPENSES
========================================================= */

function getAllExpense() {

    if (!expenseTransactionSystemAvailable()) {
        return [];
    }

    return window.RJKA_Transactions
        .getByType(EXPENSE_TRANSACTION_TYPE);

}


/* =========================================================
   GET EXPENSE BY ID
========================================================= */

function getExpenseById(id) {

    if (!expenseTransactionSystemAvailable()) {
        return null;
    }

    return window.RJKA_Transactions
        .getById(id);

}


/* =========================================================
   VALIDATE EXPENSE
========================================================= */

function validateExpense(data) {

    const errors = [];

    if (!data) {
        errors.push("Expense data is required.");
        return {
            valid: false,
            errors
        };
    }


    if (!data.date) {
        errors.push("Date is required.");
    }


    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
        errors.push("Valid amount is required.");
    }


    if (!data.categoryId) {
        errors.push("Expense category is required.");
    }


    if (!data.accountId) {
        errors.push("Account is required.");
    }


    if (!data.description ||
        String(data.description).trim() === "") {

        errors.push("Description is required.");

    }


    /* Check category from central master */

    if (
        typeof EXPENSE_CATEGORIES !== "undefined" &&
        Array.isArray(EXPENSE_CATEGORIES)
    ) {

        const categoryExists =
            EXPENSE_CATEGORIES.some(function (category) {

                return category.id === data.categoryId;

            });


        if (!categoryExists) {

            errors.push(
                "Invalid expense category."
            );

        }

    }


    return {
        valid: errors.length === 0,
        errors
    };

}


/* =========================================================
   ADD EXPENSE
========================================================= */

function addExpense(data) {

    const validation =
        validateExpense(data);


    if (!validation.valid) {

        return {
            success: false,
            message: validation.errors.join(" ")
        };

    }


    if (!expenseTransactionSystemAvailable()) {

        return {
            success: false,
            message: "Transaction system is not available."
        };

    }


    const transactionData = {

        date: data.date,

        type: EXPENSE_TRANSACTION_TYPE,

        amount: Number(data.amount),

        categoryId: data.categoryId,

        accountId: data.accountId,

        description:
            String(data.description || "").trim(),

        note:
            String(data.note || "").trim()

    };


    return window.RJKA_Transactions
        .add(transactionData);

}


/* =========================================================
   UPDATE EXPENSE
========================================================= */

function updateExpense(id, data) {

    if (!id) {

        return {
            success: false,
            message: "Expense ID is required."
        };

    }


    const validation =
        validateExpense(data);


    if (!validation.valid) {

        return {
            success: false,
            message: validation.errors.join(" ")
        };

    }


    if (!expenseTransactionSystemAvailable()) {

        return {
            success: false,
            message: "Transaction system is not available."
        };

    }


    const transactionData = {

        date: data.date,

        type: EXPENSE_TRANSACTION_TYPE,

        amount: Number(data.amount),

        categoryId: data.categoryId,

        accountId: data.accountId,

        description:
            String(data.description || "").trim(),

        note:
            String(data.note || "").trim()

    };


    return window.RJKA_Transactions
        .update(id, transactionData);

}


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(id) {

    if (!id) {

        return {
            success: false,
            message: "Expense ID is required."
        };

    }


    if (!expenseTransactionSystemAvailable()) {

        return {
            success: false,
            message: "Transaction system is not available."
        };

    }


    return window.RJKA_Transactions
        .remove(id);

}


/* =========================================================
   GET TODAY EXPENSES
========================================================= */

function getTodayExpense() {

    if (!expenseTransactionSystemAvailable()) {
        return [];
    }


    if (
        typeof getDateString === "function" &&
        typeof window.RJKA_Transactions.getByDate === "function"
    ) {

        return window.RJKA_Transactions
            .getByDate(getDateString())
            .filter(function (item) {

                return item.type ===
                    EXPENSE_TRANSACTION_TYPE;

            });

    }


    const today =
        new Date().toISOString().slice(0, 10);


    return getAllExpense()
        .filter(function (item) {

            return item.date === today;

        });

}


/* =========================================================
   GET TODAY TOTAL
========================================================= */

function getTodayExpenseTotal() {

    return getTodayExpense()
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   GET CURRENT MONTH EXPENSES
========================================================= */

function getCurrentMonthExpense() {

    const month =
        typeof getMonthString === "function"
            ? getMonthString()
            : new Date().toISOString().slice(0, 7);


    return getAllExpense()
        .filter(function (item) {

            return String(item.date || "")
                .slice(0, 7) === month;

        });

}


/* =========================================================
   GET CURRENT MONTH TOTAL
========================================================= */

function getCurrentMonthExpenseTotal() {

    return getCurrentMonthExpense()
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   GET BY DATE
========================================================= */

function getExpenseByDate(date) {

    return getAllExpense()
        .filter(function (item) {

            return item.date === date;

        });

}


/* =========================================================
   GET BY MONTH
========================================================= */

function getExpenseByMonth(month) {

    return getAllExpense()
        .filter(function (item) {

            return String(item.date || "")
                .slice(0, 7) === month;

        });

}


/* =========================================================
   GET BY ACCOUNT
========================================================= */

function getExpenseByAccount(accountId) {

    return getAllExpense()
        .filter(function (item) {

            return item.accountId === accountId;

        });

}


/* =========================================================
   GET BY CATEGORY
========================================================= */

function getExpenseByCategory(categoryId) {

    return getAllExpense()
        .filter(function (item) {

            return item.categoryId === categoryId;

        });

}


/* =========================================================
   GET CATEGORY MONTH TOTAL
========================================================= */

function getExpenseCategoryMonthTotal(
    categoryId,
    month
) {

    return getExpenseByMonth(month)
        .filter(function (item) {

            return item.categoryId === categoryId;

        })
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   GET ACCOUNT TOTAL
========================================================= */

function getExpenseAccountTotal(accountId) {

    return getExpenseByAccount(accountId)
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   GET DATE TOTAL
========================================================= */

function getExpenseDateTotal(date) {

    return getExpenseByDate(date)
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   GET MONTH TOTAL
========================================================= */

function getExpenseMonthTotal(month) {

    return getExpenseByMonth(month)
        .reduce(function (total, item) {

            return total +
                Number(item.amount || 0);

        }, 0);

}


/* =========================================================
   SEARCH EXPENSE
========================================================= */

function searchExpense(searchText) {

    const text =
        String(searchText || "")
            .trim()
            .toLowerCase();


    if (!text) {
        return getAllExpense();
    }


    return getAllExpense()
        .filter(function (item) {

            const searchableText = (

                String(item.description || "") +
                " " +
                String(item.note || "") +
                " " +
                String(item.date || "") +
                " " +
                String(item.amount || "")

            ).toLowerCase();


            return searchableText.includes(text);

        });

}


/* =========================================================
   GET LATEST EXPENSES
========================================================= */

function getLatestExpense(limit = 10) {

    return getAllExpense()
        .slice()
        .sort(function (a, b) {

            return String(b.date || "")
                .localeCompare(String(a.date || ""));

        })
        .slice(0, limit);

}


/* =========================================================
   SORT EXPENSE
========================================================= */

function sortExpense(
    list,
    field = "date",
    direction = "desc"
) {

    const expenses =
        Array.isArray(list)
            ? list.slice()
            : getAllExpense();


    expenses.sort(function (a, b) {

        let valueA = a[field];
        let valueB = b[field];


        if (field === "amount") {

            valueA = Number(valueA || 0);
            valueB = Number(valueB || 0);

        } else {

            valueA =
                String(valueA || "").toLowerCase();

            valueB =
                String(valueB || "").toLowerCase();

        }


        if (valueA < valueB) {
            return direction === "asc" ? -1 : 1;
        }


        if (valueA > valueB) {
            return direction === "asc" ? 1 : -1;
        }


        return 0;

    });


    return expenses;

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getExpenseCategoryName(categoryId) {

    if (
        typeof EXPENSE_CATEGORIES === "undefined" ||
        !Array.isArray(EXPENSE_CATEGORIES)
    ) {

        return categoryId || "";

    }


    const category =
        EXPENSE_CATEGORIES.find(function (item) {

            return item.id === categoryId;

        });


    return category
        ? category.name
        : categoryId || "";

}


/* =========================================================
   ACCOUNT NAME
========================================================= */

function getExpenseAccountName(accountId) {

    if (
        typeof AppData === "undefined" ||
        typeof AppData.getAccounts !== "function"
    ) {

        return accountId || "";

    }


    const accounts =
        AppData.getAccounts() || [];


    const account =
        accounts.find(function (item) {

            return item.id === accountId;

        });


    return account
        ? account.name
        : "Unknown Account";

}


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatExpenseAmount(amount) {

    if (
        typeof window.RJKA_Transactions !== "undefined" &&
        typeof window.RJKA_Transactions.formatAmount === "function"
    ) {

        return window.RJKA_Transactions
            .formatAmount(amount);

    }


    if (typeof formatCurrency === "function") {

        return formatCurrency(amount);

    }


    return "₹" +
        Number(amount || 0)
            .toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

}


/* =========================================================
   GET DISPLAY DATA
========================================================= */

function getExpenseDisplayData(expense) {

    if (!expense) {
        return null;
    }


    return {

        id: expense.id,

        date: expense.date,

        type: expense.type,

        amount: Number(expense.amount || 0),

        amountFormatted:
            formatExpenseAmount(expense.amount),

        categoryId:
            expense.categoryId || "",

        categoryName:
            getExpenseCategoryName(
                expense.categoryId
            ),

        accountId:
            expense.accountId || "",

        accountName:
            getExpenseAccountName(
                expense.accountId
            ),

        description:
            expense.description || "",

        note:
            expense.note || "",

        createdAt:
            expense.createdAt || "",

        updatedAt:
            expense.updatedAt || ""

    };

}


/* =========================================================
   SUMMARY
========================================================= */

function getExpenseSummary() {

    const all =
        getAllExpense();


    const today =
        getTodayExpense();


    const month =
        getCurrentMonthExpense();


    return {

        totalCount:
            all.length,

        totalAmount:
            all.reduce(function (total, item) {

                return total +
                    Number(item.amount || 0);

            }, 0),

        todayCount:
            today.length,

        todayAmount:
            today.reduce(function (total, item) {

                return total +
                    Number(item.amount || 0);

            }, 0),

        currentMonthCount:
            month.length,

        currentMonthAmount:
            month.reduce(function (total, item) {

                return total +
                    Number(item.amount || 0);

            }, 0)

    };

}


/* =========================================================
   STORAGE INFO
========================================================= */

function getExpenseStorageInfo() {

    return {

        storageKey:
            EXPENSE_STORAGE_KEY,

        type:
            EXPENSE_TRANSACTION_TYPE,

        recordCount:
            getAllExpense().length,

        centralStorage:
            true

    };

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeExpenseSystem() {

    if (!expenseTransactionSystemAvailable()) {

        console.warn(
            "Expense system: transactions.js is not loaded."
        );

        return false;

    }


    return true;

}


/* =========================================================
   GLOBAL EXPENSE API
========================================================= */

window.RJKA_Expense = {

    type:
        EXPENSE_TRANSACTION_TYPE,

    storageKey:
        EXPENSE_STORAGE_KEY,

    getAll:
        getAllExpense,

    getById:
        getExpenseById,

    add:
        addExpense,

    update:
        updateExpense,

    remove:
        deleteExpense,

    getToday:
        getTodayExpense,

    getTodayTotal:
        getTodayExpenseTotal,

    getCurrentMonth:
        getCurrentMonthExpense,

    getCurrentMonthTotal:
        getCurrentMonthExpenseTotal,

    getByDate:
        getExpenseByDate,

    getByMonth:
        getExpenseByMonth,

    getByAccount:
        getExpenseByAccount,

    getByCategory:
        getExpenseByCategory,

    getCategoryMonthTotal:
        getExpenseCategoryMonthTotal,

    getAccountTotal:
        getExpenseAccountTotal,

    getDateTotal:
        getExpenseDateTotal,

    getMonthTotal:
        getExpenseMonthTotal,

    search:
        searchExpense,

    getLatest:
        getLatestExpense,

    sort:
        sortExpense,

    getCategoryName:
        getExpenseCategoryName,

    getAccountName:
        getExpenseAccountName,

    getDisplayData:
        getExpenseDisplayData,

    getSummary:
        getExpenseSummary,

    formatAmount:
        formatExpenseAmount,

    validate:
        validateExpense,

    getStorageInfo:
        getExpenseStorageInfo

};


/* =========================================================
   READY EVENT
========================================================= */

document.dispatchEvent(
    new CustomEvent("expenseSystemReady")
);


/* =========================================================
   INITIALIZE
========================================================= */

initializeExpenseSystem();
