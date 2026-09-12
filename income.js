/* =========================================================
   income.js
   रोजचा जमा खर्च अहवाल

   INCOME MANAGEMENT
   VERSION: 1.0.0

   CENTRAL STORAGE:
   RJKA_v1_transactions

   IMPORTANT:
   ---------------------------------------------------------
   Income साठी स्वतंत्र storage key नाही.

   प्रत्येक जमा व्यवहार:
   {
       id,
       date,
       type: "income",
       amount,
       categoryId: "",
       accountId,
       description,
       note,
       createdAt,
       updatedAt
   }

   CENTRAL FLOW:
   ---------------------------------------------------------
   Income Entry
        ↓
   RJKA_v1_transactions
        ↓
   Account Balance
        ↓
   Dashboard
        ↓
   Reports

   NO OLD STORAGE KEYS.
========================================================= */


/* =========================================================
   CENTRAL CONSTANT
========================================================= */

const INCOME_TRANSACTION_TYPE = "income";


/* =========================================================
   CHECK TRANSACTION SYSTEM
========================================================= */

function incomeTransactionSystemReady() {

    return (
        typeof addTransaction === "function" &&
        typeof getAllTransactions === "function" &&
        typeof getIncomeTransactions === "function" &&
        typeof updateTransaction === "function" &&
        typeof deleteTransaction === "function"
    );
}


/* =========================================================
   GET ALL INCOME
========================================================= */

function getAllIncome() {

    if (
        typeof getIncomeTransactions !==
        "function"
    ) {

        return [];
    }


    return getIncomeTransactions();
}


/* =========================================================
   GET INCOME BY ID
========================================================= */

function getIncomeById(
    transactionId
) {

    if (
        typeof getTransactionById !==
        "function"
    ) {

        return null;
    }


    const transaction =
        getTransactionById(
            transactionId
        );


    if (
        !transaction ||
        transaction.type !==
            INCOME_TRANSACTION_TYPE
    ) {

        return null;
    }


    return transaction;
}


/* =========================================================
   VALIDATE INCOME
========================================================= */

function validateIncome(
    data
) {

    const errors = [];


    if (!data) {

        errors.push(
            "Income data is required."
        );

        return errors;
    }


    /* DATE */

    if (!data.date) {

        errors.push(
            "तारीख आवश्यक आहे."
        );
    }


    /* AMOUNT */

    const amount =
        Number(data.amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        errors.push(
            "जमा रक्कम 0 पेक्षा जास्त असावी."
        );
    }


    /* ACCOUNT */

    if (!data.accountId) {

        errors.push(
            "Account निवडा."
        );
    }


    return errors;
}


/* =========================================================
   ADD INCOME
========================================================= */

function addIncome(
    data
) {

    if (!incomeTransactionSystemReady()) {

        return {

            success: false,

            errors: [
                "Transaction system is not loaded."
            ],

            transaction: null
        };
    }


    const incomeData = {

        date:
            data && data.date
                ? data.date
                : (
                    typeof getDateString ===
                    "function"
                        ? getDateString()
                        : new Date()
                            .toISOString()
                            .substring(0, 10)
                ),

        type:
            INCOME_TRANSACTION_TYPE,

        amount:
            data && data.amount
                ? Number(data.amount)
                : 0,

        categoryId:
            "",

        accountId:
            data && data.accountId
                ? data.accountId
                : "",

        description:
            data && data.description
                ? String(
                    data.description
                ).trim()
                : "",

        note:
            data && data.note
                ? String(
                    data.note
                ).trim()
                : ""
    };


    const validationErrors =
        validateIncome(
            incomeData
        );


    if (
        validationErrors.length > 0
    ) {

        return {

            success: false,

            errors:
                validationErrors,

            transaction: null
        };
    }


    /*
       IMPORTANT:
       Income is saved through the
       central transaction system.
    */

    const result =
        addTransaction(
            incomeData
        );


    return result;
}


/* =========================================================
   UPDATE INCOME
========================================================= */

function updateIncome(
    transactionId,
    data
) {

    if (!incomeTransactionSystemReady()) {

        return {

            success: false,

            errors: [
                "Transaction system is not loaded."
            ],

            transaction: null
        };
    }


    const existing =
        getIncomeById(
            transactionId
        );


    if (!existing) {

        return {

            success: false,

            errors: [
                "Income transaction not found."
            ],

            transaction: null
        };
    }


    const incomeData = {

        date:
            data && data.date
                ? data.date
                : existing.date,

        type:
            INCOME_TRANSACTION_TYPE,

        amount:
            data && data.amount !== undefined
                ? Number(data.amount)
                : existing.amount,

        categoryId:
            "",

        accountId:
            data && data.accountId
                ? data.accountId
                : existing.accountId,

        description:
            data &&
            data.description !== undefined
                ? String(
                    data.description
                ).trim()
                : existing.description,

        note:
            data &&
            data.note !== undefined
                ? String(
                    data.note
                ).trim()
                : existing.note
    };


    const validationErrors =
        validateIncome(
            incomeData
        );


    if (
        validationErrors.length > 0
    ) {

        return {

            success: false,

            errors:
                validationErrors,

            transaction: null
        };
    }


    /*
       Force type to income.
       Income can never become expense
       through this module.
    */

    incomeData.type =
        INCOME_TRANSACTION_TYPE;


    return updateTransaction(
        transactionId,
        incomeData
    );
}


/* =========================================================
   DELETE INCOME
========================================================= */

function deleteIncome(
    transactionId
) {

    if (!incomeTransactionSystemReady()) {

        return {

            success: false,

            errors: [
                "Transaction system is not loaded."
            ]
        };
    }


    const existing =
        getIncomeById(
            transactionId
        );


    if (!existing) {

        return {

            success: false,

            errors: [
                "Income transaction not found."
            ]
        };
    }


    /*
       Delete from central transactions.
    */

    return deleteTransaction(
        transactionId
    );
}


/* =========================================================
   GET TODAY INCOME
========================================================= */

function getTodayIncome() {

    if (
        typeof getTodayTransactions !==
        "function"
    ) {

        return [];
    }


    return getTodayTransactions()
        .filter(
            transaction =>
                transaction.type ===
                INCOME_TRANSACTION_TYPE
        );
}


/* =========================================================
   TODAY INCOME TOTAL
========================================================= */

function getTodayIncomeTotal() {

    const transactions =
        getTodayIncome();


    if (
        typeof calculateTransactionTotal !==
        "function"
    ) {

        return transactions.reduce(
            (
                total,
                transaction
            ) =>
                total +
                Number(
                    transaction.amount
                ),
            0
        );
    }


    return calculateTransactionTotal(
        transactions
    );
}


/* =========================================================
   CURRENT MONTH INCOME
========================================================= */

function getCurrentMonthIncome() {

    if (
        typeof getCurrentMonthTransactions !==
        "function"
    ) {

        return [];
    }


    return getCurrentMonthTransactions()
        .filter(
            transaction =>
                transaction.type ===
                INCOME_TRANSACTION_TYPE
        );
}


/* =========================================================
   CURRENT MONTH INCOME TOTAL
========================================================= */

function getCurrentMonthIncomeTotal() {

    const transactions =
        getCurrentMonthIncome();


    if (
        typeof calculateTransactionTotal !==
        "function"
    ) {

        return transactions.reduce(
            (
                total,
                transaction
            ) =>
                total +
                Number(
                    transaction.amount
                ),
            0
        );
    }


    return calculateTransactionTotal(
        transactions
    );
}


/* =========================================================
   INCOME BY DATE
========================================================= */

function getIncomeByDate(
    date
) {

    if (
        typeof getTransactionsByDate !==
        "function"
    ) {

        return [];
    }


    return getTransactionsByDate(
        date
    ).filter(
        transaction =>
            transaction.type ===
            INCOME_TRANSACTION_TYPE
    );
}


/* =========================================================
   INCOME BY MONTH
========================================================= */

function getIncomeByMonth(
    month
) {

    if (
        typeof getTransactionsByMonth !==
        "function"
    ) {

        return [];
    }


    return getTransactionsByMonth(
        month
    ).filter(
        transaction =>
            transaction.type ===
            INCOME_TRANSACTION_TYPE
    );
}


/* =========================================================
   INCOME BY ACCOUNT
========================================================= */

function getIncomeByAccount(
    accountId
) {

    if (
        typeof getTransactionsByAccount !==
        "function"
    ) {

        return [];
    }


    return getTransactionsByAccount(
        accountId
    ).filter(
        transaction =>
            transaction.type ===
            INCOME_TRANSACTION_TYPE
    );
}


/* =========================================================
   ACCOUNT-WISE INCOME TOTAL
========================================================= */

function getAccountIncomeTotal(
    accountId
) {

    const transactions =
        getIncomeByAccount(
            accountId
        );


    return transactions.reduce(
        (
            total,
            transaction
        ) => {

            return total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                );

        },
        0
    );
}


/* =========================================================
   DATE-WISE INCOME TOTAL
========================================================= */

function getDateIncomeTotal(
    date
) {

    const transactions =
        getIncomeByDate(
            date
        );


    return transactions.reduce(
        (
            total,
            transaction
        ) => {

            return total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                );

        },
        0
    );
}


/* =========================================================
   MONTH-WISE INCOME TOTAL
========================================================= */

function getMonthIncomeTotal(
    month
) {

    const transactions =
        getIncomeByMonth(
            month
        );


    return transactions.reduce(
        (
            total,
            transaction
        ) => {

            return total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                );

        },
        0
    );
}


/* =========================================================
   SEARCH INCOME
========================================================= */

function searchIncome(
    searchText
) {

    const search =
        String(
            searchText || ""
        )
        .trim()
        .toLowerCase();


    const incomes =
        getAllIncome();


    if (!search) {

        return incomes;
    }


    return incomes.filter(
        transaction => {

            const accountName =
                typeof getTransactionAccountName ===
                "function"
                    ? getTransactionAccountName(
                        transaction.accountId
                    )
                    : "";


            const text = [

                transaction.date,

                transaction.amount,

                transaction.description,

                transaction.note,

                accountName

            ]
            .join(" ")
            .toLowerCase();


            return text.includes(
                search
            );
        }
    );
}


/* =========================================================
   SORT INCOME
========================================================= */

function sortIncomeLatestFirst(
    incomes
) {

    if (!Array.isArray(incomes)) {

        return [];
    }


    return [...incomes].sort(
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
   LATEST INCOME
========================================================= */

function getLatestIncome(
    limit = 10
) {

    return sortIncomeLatestFirst(
        getAllIncome()
    ).slice(
        0,
        Math.max(
            0,
            Number(limit) || 10
        )
    );
}


/* =========================================================
   INCOME SUMMARY
========================================================= */

function getIncomeSummary() {

    const incomes =
        getAllIncome();


    const total =
        incomes.reduce(
            (
                sum,
                transaction
            ) => {

                return sum +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    );

            },
            0
        );


    return {

        count:
            incomes.length,

        total:
            total
    };
}


/* =========================================================
   FORMAT INCOME AMOUNT
========================================================= */

function formatIncomeAmount(
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
   INCOME DISPLAY DATA
========================================================= */

function getIncomeDisplayData(
    transaction
) {

    if (!transaction) {

        return null;
    }


    return {

        id:
            transaction.id,

        date:
            transaction.date,

        type:
            "income",

        amount:
            Number(
                transaction.amount
            ) || 0,

        accountId:
            transaction.accountId || "",

        accountName:
            typeof getTransactionAccountName ===
            "function"
                ? getTransactionAccountName(
                    transaction.accountId
                )
                : "",

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
   INCOME STORAGE INFORMATION
========================================================= */

function getIncomeStorageInfo() {

    return {

        storageKey:
            "RJKA_v1_transactions",

        transactionType:
            INCOME_TRANSACTION_TYPE,

        summary:
            getIncomeSummary()
    };
}


/* =========================================================
   GLOBAL INCOME API
========================================================= */

window.RJKA_Income = {

    type:
        INCOME_TRANSACTION_TYPE,

    storageKey:
        "RJKA_v1_transactions",

    getAll:
        getAllIncome,

    getById:
        getIncomeById,

    add:
        addIncome,

    update:
        updateIncome,

    remove:
        deleteIncome,

    getToday:
        getTodayIncome,

    getTodayTotal:
        getTodayIncomeTotal,

    getCurrentMonth:
        getCurrentMonthIncome,

    getCurrentMonthTotal:
        getCurrentMonthIncomeTotal,

    getByDate:
        getIncomeByDate,

    getByMonth:
        getIncomeByMonth,

    getByAccount:
        getIncomeByAccount,

    getAccountTotal:
        getAccountIncomeTotal,

    getDateTotal:
        getDateIncomeTotal,

    getMonthTotal:
        getMonthIncomeTotal,

    search:
        searchIncome,

    getLatest:
        getLatestIncome,

    getSummary:
        getIncomeSummary,

    getDisplayData:
        getIncomeDisplayData,

    formatAmount:
        formatIncomeAmount,

    validate:
        validateIncome
};


/* =========================================================
   READY EVENT
========================================================= */

window.dispatchEvent(
    new CustomEvent(
        "incomeSystemReady",
        {
            detail: {
                storageKey:
                    "RJKA_v1_transactions",

                type:
                    INCOME_TRANSACTION_TYPE
            }
        }
    )
);


/* =========================================================
   END OF income.js
========================================================= */
