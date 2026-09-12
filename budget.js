/* =========================================================
   budget.js
   रोजचा जमा खर्च अहवाल

   BUDGET MANAGEMENT
   CENTRAL APP VERSION

   STORAGE:
   RJKA_v1_budgets

   ACTUAL EXPENSE:
   RJKA_v1_transactions

   IMPORTANT:
   - Budget records are stored separately
   - Actual expenses come ONLY from central transactions
   - Expense categories are taken from EXPENSE_CATEGORIES
========================================================= */

const BUDGET_STORAGE_KEY = "RJKA_v1_budgets";


/* =========================================================
   STORAGE HELPERS
========================================================= */

function getBudgetStorage() {

    try {

        const data =
            localStorage.getItem(BUDGET_STORAGE_KEY);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "Budget storage read error:",
            error
        );

        return [];

    }

}


function saveBudgetStorage(data) {

    try {

        localStorage.setItem(
            BUDGET_STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "Budget storage save error:",
            error
        );

        return false;

    }

}


/* =========================================================
   GENERATE BUDGET ID
========================================================= */

function generateBudgetId() {

    if (typeof generateId === "function") {

        return generateId("BUD");

    }


    return "BUD-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


/* =========================================================
   NORMALIZE BUDGET
========================================================= */

function normalizeBudget(data) {

    return {

        id:
            data.id ||
            generateBudgetId(),

        month:
            String(data.month || ""),

        categoryId:
            String(data.categoryId || ""),

        amount:
            Number(data.amount || 0),

        createdAt:
            data.createdAt ||
            new Date().toISOString(),

        updatedAt:
            data.updatedAt ||
            new Date().toISOString()

    };

}


/* =========================================================
   VALIDATE BUDGET
========================================================= */

function validateBudget(data) {

    const errors = [];


    if (!data) {

        errors.push(
            "Budget data is required."
        );

        return {
            valid: false,
            errors
        };

    }


    if (!data.month) {

        errors.push(
            "Month is required."
        );

    }


    if (!/^\d{4}-\d{2}$/.test(
        String(data.month || "")
    )) {

        errors.push(
            "Invalid month."
        );

    }


    if (!data.categoryId) {

        errors.push(
            "Category is required."
        );

    }


    if (
        typeof EXPENSE_CATEGORIES !== "undefined" &&
        Array.isArray(EXPENSE_CATEGORIES)
    ) {

        const categoryExists =
            EXPENSE_CATEGORIES.some(
                function (category) {

                    return category.id ===
                        data.categoryId;

                }
            );


        if (!categoryExists) {

            errors.push(
                "Invalid budget category."
            );

        }

    }


    const amount =
        Number(data.amount);


    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        errors.push(
            "Budget amount cannot be negative."
        );

    }


    return {

        valid:
            errors.length === 0,

        errors

    };

}


/* =========================================================
   GET ALL BUDGETS
========================================================= */

function getAllBudgets() {

    return getBudgetStorage()
        .map(normalizeBudget);

}


/* =========================================================
   GET BUDGET BY ID
========================================================= */

function getBudgetById(id) {

    return getAllBudgets()
        .find(function (budget) {

            return budget.id === id;

        }) || null;

}


/* =========================================================
   GET BUDGET BY MONTH
========================================================= */

function getBudgetsByMonth(month) {

    return getAllBudgets()
        .filter(function (budget) {

            return budget.month === month;

        });

}


/* =========================================================
   GET BUDGET BY CATEGORY
========================================================= */

function getBudgetsByCategory(categoryId) {

    return getAllBudgets()
        .filter(function (budget) {

            return budget.categoryId ===
                categoryId;

        });

}


/* =========================================================
   GET SPECIFIC CATEGORY MONTH BUDGET
========================================================= */

function getBudgetForCategory(
    categoryId,
    month
) {

    const budget =
        getAllBudgets()
            .find(function (item) {

                return (
                    item.categoryId === categoryId &&
                    item.month === month
                );

            });


    return budget
        ? Number(budget.amount || 0)
        : 0;

}


/* =========================================================
   ADD BUDGET
========================================================= */

function addBudget(data) {

    const validation =
        validateBudget(data);


    if (!validation.valid) {

        return {

            success: false,

            message:
                validation.errors.join(" ")

        };

    }


    const budgets =
        getAllBudgets();


    const duplicate =
        budgets.find(function (budget) {

            return (
                budget.month === data.month &&
                budget.categoryId ===
                    data.categoryId
            );

        });


    if (duplicate) {

        return {

            success: false,

            message:
                "या category साठी या महिन्याचा budget आधीच आहे."

        };

    }


    const budget =
        normalizeBudget({

            id:
                generateBudgetId(),

            month:
                data.month,

            categoryId:
                data.categoryId,

            amount:
                Number(data.amount),

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        });


    budgets.push(budget);


    if (!saveBudgetStorage(budgets)) {

        return {

            success: false,

            message:
                "Budget save करता आला नाही."

        };

    }


    dispatchBudgetChanged();


    return {

        success: true,

        data: budget,

        message:
            "Budget successfully added."

    };

}


/* =========================================================
   UPDATE BUDGET
========================================================= */

function updateBudget(id, data) {

    const validation =
        validateBudget(data);


    if (!validation.valid) {

        return {

            success: false,

            message:
                validation.errors.join(" ")

        };

    }


    const budgets =
        getAllBudgets();


    const index =
        budgets.findIndex(function (budget) {

            return budget.id === id;

        });


    if (index === -1) {

        return {

            success: false,

            message:
                "Budget सापडला नाही."

        };

    }


    const duplicate =
        budgets.find(function (budget) {

            return (
                budget.id !== id &&
                budget.month === data.month &&
                budget.categoryId ===
                    data.categoryId
            );

        });


    if (duplicate) {

        return {

            success: false,

            message:
                "या category साठी या महिन्याचा budget आधीच आहे."

        };

    }


    budgets[index] = {

        ...budgets[index],

        month:
            data.month,

        categoryId:
            data.categoryId,

        amount:
            Number(data.amount),

        updatedAt:
            new Date().toISOString()

    };


    if (!saveBudgetStorage(budgets)) {

        return {

            success: false,

            message:
                "Budget update करता आला नाही."

        };

    }


    dispatchBudgetChanged();


    return {

        success: true,

        data:
            budgets[index],

        message:
            "Budget successfully updated."

    };

}


/* =========================================================
   DELETE BUDGET
========================================================= */

function deleteBudget(id) {

    const budgets =
        getAllBudgets();


    const index =
        budgets.findIndex(function (budget) {

            return budget.id === id;

        });


    if (index === -1) {

        return {

            success: false,

            message:
                "Budget सापडला नाही."

        };

    }


    budgets.splice(index, 1);


    if (!saveBudgetStorage(budgets)) {

        return {

            success: false,

            message:
                "Budget delete करता आला नाही."

        };

    }


    dispatchBudgetChanged();


    return {

        success: true,

        message:
            "Budget successfully deleted."

    };

}


/* =========================================================
   GET ACTUAL EXPENSES
========================================================= */

function getBudgetActualExpense(
    categoryId,
    month
) {

    if (
        typeof window.RJKA_Transactions !==
        "undefined" &&
        typeof window.RJKA_Transactions
            .getByCategory === "function"
    ) {


        const transactions =
            window.RJKA_Transactions
                .getByCategory(categoryId);


        return transactions
            .filter(function (item) {

                return (
                    item.type === "expense" &&
                    String(item.date || "")
                        .slice(0, 7) === month
                );

            })
            .reduce(function (total, item) {

                return total +
                    Number(item.amount || 0);

            }, 0);

    }


    return 0;

}


/* =========================================================
   GET TOTAL BUDGET
========================================================= */

function getTotalBudget(month) {

    return getBudgetsByMonth(month)
        .reduce(function (total, budget) {

            return total +
                Number(budget.amount || 0);

        }, 0);

}


/* =========================================================
   GET TOTAL ACTUAL EXPENSE
========================================================= */

function getTotalActualExpense(month) {

    if (
        typeof window.RJKA_Transactions !==
        "undefined" &&
        typeof window.RJKA_Transactions
            .getByMonth === "function"
    ) {

        return window.RJKA_Transactions
            .getByMonth(month)
            .filter(function (item) {

                return item.type === "expense";

            })
            .reduce(function (total, item) {

                return total +
                    Number(item.amount || 0);

            }, 0);

    }


    return 0;

}


/* =========================================================
   GET REMAINING
========================================================= */

function getTotalBudgetRemaining(month) {

    return (
        getTotalBudget(month) -
        getTotalActualExpense(month)
    );

}


/* =========================================================
   GET USED PERCENTAGE
========================================================= */

function getBudgetUsedPercent(month) {

    const budget =
        getTotalBudget(month);


    const actual =
        getTotalActualExpense(month);


    if (budget <= 0) {

        return actual > 0
            ? 100
            : 0;

    }


    return (
        actual / budget
    ) * 100;

}


/* =========================================================
   GET CATEGORY STATUS
========================================================= */

function getCategoryBudgetStatus(
    categoryId,
    month
) {

    const budget =
        getBudgetForCategory(
            categoryId,
            month
        );


    const actual =
        getBudgetActualExpense(
            categoryId,
            month
        );


    const remaining =
        budget - actual;


    let usedPercent = 0;


    if (budget > 0) {

        usedPercent =
            (actual / budget) * 100;

    } else if (actual > 0) {

        usedPercent = 100;

    }


    let status = "normal";


    if (budget === 0 && actual > 0) {

        status = "no-budget";

    } else if (usedPercent >= 100) {

        status = "over";

    } else if (usedPercent >= 80) {

        status = "warning";

    }


    return {

        categoryId,

        month,

        budget,

        actual,

        remaining,

        usedPercent,

        status

    };

}


/* =========================================================
   GET MONTH SUMMARY
========================================================= */

function getBudgetMonthSummary(month) {

    const totalBudget =
        getTotalBudget(month);


    const totalActual =
        getTotalActualExpense(month);


    const remaining =
        totalBudget -
        totalActual;


    let usedPercent = 0;


    if (totalBudget > 0) {

        usedPercent =
            (totalActual / totalBudget) * 100;

    } else if (totalActual > 0) {

        usedPercent = 100;

    }


    return {

        month,

        totalBudget,

        totalActual,

        remaining,

        usedPercent,

        budgetCount:
            getBudgetsByMonth(month).length

    };

}


/* =========================================================
   GET CATEGORY REPORT
========================================================= */

function getCategoryBudgetReport(month) {

    if (
        typeof EXPENSE_CATEGORIES ===
        "undefined" ||
        !Array.isArray(EXPENSE_CATEGORIES)
    ) {

        return [];

    }


    return EXPENSE_CATEGORIES.map(
        function (category) {

            const status =
                getCategoryBudgetStatus(
                    category.id,
                    month
                );


            return {

                ...status,

                categoryName:
                    category.name

            };

        }
    );

}


/* =========================================================
   FORMAT AMOUNT
========================================================= */

function formatBudgetAmount(amount) {

    if (
        typeof formatCurrency ===
        "function"
    ) {

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
   CATEGORY NAME
========================================================= */

function getBudgetCategoryName(categoryId) {

    if (
        typeof EXPENSE_CATEGORIES ===
        "undefined" ||
        !Array.isArray(EXPENSE_CATEGORIES)
    ) {

        return categoryId || "";

    }


    const category =
        EXPENSE_CATEGORIES.find(
            function (item) {

                return item.id ===
                    categoryId;

            }
        );


    return category
        ? category.name
        : categoryId;

}


/* =========================================================
   SEARCH BUDGET
========================================================= */

function searchBudget(text) {

    const search =
        String(text || "")
            .trim()
            .toLowerCase();


    if (!search) {

        return getAllBudgets();

    }


    return getAllBudgets()
        .filter(function (budget) {

            return (

                budget.month
                    .toLowerCase()
                    .includes(search)

                ||

                getBudgetCategoryName(
                    budget.categoryId
                )
                    .toLowerCase()
                    .includes(search)

            );

        });

}


/* =========================================================
   BUDGET EVENT
========================================================= */

function dispatchBudgetChanged() {

    document.dispatchEvent(
        new CustomEvent(
            "budgetsChanged"
        )
    );

}


/* =========================================================
   INITIALIZE BUDGET STORAGE
========================================================= */

function initializeBudgetStorage() {

    if (
        localStorage.getItem(
            BUDGET_STORAGE_KEY
        ) === null
    ) {

        localStorage.setItem(
            BUDGET_STORAGE_KEY,
            JSON.stringify([])
        );

    }

}


/* =========================================================
   GLOBAL API
========================================================= */

window.RJKA_Budget = {

    storageKey:
        BUDGET_STORAGE_KEY,

    getAll:
        getAllBudgets,

    getById:
        getBudgetById,

    getByMonth:
        getBudgetsByMonth,

    getByCategory:
        getBudgetsByCategory,

    getForCategory:
        getBudgetForCategory,

    add:
        addBudget,

    update:
        updateBudget,

    remove:
        deleteBudget,

    getActualExpense:
        getBudgetActualExpense,

    getTotalBudget:
        getTotalBudget,

    getTotalActualExpense:
        getTotalActualExpense,

    getRemaining:
        getTotalBudgetRemaining,

    getUsedPercent:
        getBudgetUsedPercent,

    getCategoryStatus:
        getCategoryBudgetStatus,

    getMonthSummary:
        getBudgetMonthSummary,

    getCategoryReport:
        getCategoryBudgetReport,

    getCategoryName:
        getBudgetCategoryName,

    search:
        searchBudget,

    formatAmount:
        formatBudgetAmount,

    validate:
        validateBudget

};


/* =========================================================
   INITIALIZE
========================================================= */

initializeBudgetStorage();
