/* =========================================================
   app.js
   रोजचा जमा खर्च अहवाल
   CENTRAL APP FOUNDATION

   VERSION:
   RJKA v1

   RESPONSIBILITIES:
   ---------------------------------------------------------
   ✅ Central Storage Configuration
   ✅ Common Constants
   ✅ Expense Categories
   ✅ Default Accounts
   ✅ Default Settings
   ✅ Common Utility Functions
   ✅ Dashboard Calculations
   ✅ Budget Dashboard Calculations
   ✅ Account Balance Calculation
   ✅ Page Navigation
   ✅ Side Menu
   ✅ Common Event Handling

   IMPORTANT:
   ---------------------------------------------------------
   ONE TRANSACTION = ONE MASTER RECORD

   Income:
   type = "income"

   Expense:
   type = "expense"

   Central Transaction Storage:
   RJKA_v1_transactions

   ONLY NEW APP KEYS ARE USED.
========================================================= */


/* =========================================================
   APP VERSION
========================================================= */

const APP_VERSION = "1.0.0";


/* =========================================================
   CENTRAL STORAGE
========================================================= */

const STORAGE = {

    transactions: "RJKA_v1_transactions",

    accounts: "RJKA_v1_accounts",

    budgets: "RJKA_v1_budgets",

    lending: "RJKA_v1_lending",

    workplan: "RJKA_v1_workplan",

    settings: "RJKA_v1_settings"

};


/* =========================================================
   PAGE FILE MAP
========================================================= */

const PAGE_FILES = {

    dashboard: "index.html",

    income: "income.html",

    expense: "expense.html",

    budget: "budget.html",

    accounts: "accounts.html",

    transactions: "transactions.html",

    reports: "reports.html",

    lending: "lending.html",

    workplan: "workplan.html",

    settings: "settings.html"

};


/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

const EXPENSE_CATEGORIES = [

    {
        id: "daily_grocery",
        name: "दररोजचा किराणा खर्च"
    },

    {
        id: "monthly_grocery",
        name: "महिन्याचा किराणा खर्च"
    },

    {
        id: "travel",
        name: "प्रवास"
    },

    {
        id: "shopping",
        name: "खरेदी"
    },

    {
        id: "electricity",
        name: "लाईट बिल"
    },

    {
        id: "medicine",
        name: "औषधे"
    },

    {
        id: "mobile",
        name: "मोबाईल"
    },

    {
        id: "home_emi",
        name: "घरचा EMI"
    },

    {
        id: "home_maintenance",
        name: "घरचा मेंटेनन्स"
    },

    {
        id: "other_loan",
        name: "इतर लोन"
    },

    {
        id: "fish",
        name: "मच्छी"
    },

    {
        id: "outside_food",
        name: "बाहेर जेवण"
    },

    {
        id: "other",
        name: "Other"
    }

];


/* =========================================================
   DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNTS = [

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
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    appVersion: APP_VERSION,

    currency: "₹",

    firstDayOfWeek: "monday",

    financialYearStartMonth: 4

};


/* =========================================================
   STORAGE HELPERS
========================================================= */

function readStorage(key, fallback = []) {

    try {

        const raw = localStorage.getItem(key);

        if (raw === null || raw === "") {

            return fallback;

        }

        const parsed = JSON.parse(raw);

        return parsed;

    } catch (error) {

        console.error(
            "Storage read error:",
            key,
            error
        );

        return fallback;

    }

}


function writeStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Storage write error:",
            key,
            error
        );

        return false;

    }

}


/* =========================================================
   CENTRAL APP DATA
========================================================= */

const AppData = {

    get transactions() {

        return readStorage(
            STORAGE.transactions,
            []
        );

    },

    set transactions(value) {

        writeStorage(
            STORAGE.transactions,
            Array.isArray(value) ? value : []
        );

    },


    get accounts() {

        return readStorage(
            STORAGE.accounts,
            []
        );

    },

    set accounts(value) {

        writeStorage(
            STORAGE.accounts,
            Array.isArray(value) ? value : []
        );

    },


    get budgets() {

        return readStorage(
            STORAGE.budgets,
            []
        );

    },

    set budgets(value) {

        writeStorage(
            STORAGE.budgets,
            Array.isArray(value) ? value : []
        );

    },


    get lending() {

        return readStorage(
            STORAGE.lending,
            []
        );

    },

    set lending(value) {

        writeStorage(
            STORAGE.lending,
            Array.isArray(value) ? value : []
        );

    },


    get workplan() {

        return readStorage(
            STORAGE.workplan,
            []
        );

    },

    set workplan(value) {

        writeStorage(
            STORAGE.workplan,
            Array.isArray(value) ? value : []
        );

    },


    get settings() {

        return readStorage(
            STORAGE.settings,
            DEFAULT_SETTINGS
        );

    },

    set settings(value) {

        writeStorage(
            STORAGE.settings,
            value || DEFAULT_SETTINGS
        );

    }

};


/* =========================================================
   INITIALIZE APP DATA
========================================================= */

function initializeAppData() {

    /* -----------------------------------------------------
       Transactions
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.transactions) === null) {

        writeStorage(
            STORAGE.transactions,
            []
        );

    }


    /* -----------------------------------------------------
       Accounts
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.accounts) === null) {

        writeStorage(
            STORAGE.accounts,
            DEFAULT_ACCOUNTS.map(account => ({
                ...account
            }))
        );

    } else {

        const accounts = readStorage(
            STORAGE.accounts,
            []
        );

        /*
           If accounts already exist, do not overwrite them.
           Missing default accounts are added safely.
        */

        let changed = false;

        DEFAULT_ACCOUNTS.forEach(defaultAccount => {

            const exists = accounts.some(
                account => account.id === defaultAccount.id
            );

            if (!exists) {

                accounts.push({
                    ...defaultAccount
                });

                changed = true;

            }

        });

        if (changed) {

            writeStorage(
                STORAGE.accounts,
                accounts
            );

        }

    }


    /* -----------------------------------------------------
       Budgets
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.budgets) === null) {

        writeStorage(
            STORAGE.budgets,
            []
        );

    }


    /* -----------------------------------------------------
       Lending
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.lending) === null) {

        writeStorage(
            STORAGE.lending,
            []
        );

    }


    /* -----------------------------------------------------
       Work Plan
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.workplan) === null) {

        writeStorage(
            STORAGE.workplan,
            []
        );

    }


    /* -----------------------------------------------------
       Settings
    ----------------------------------------------------- */

    if (localStorage.getItem(STORAGE.settings) === null) {

        writeStorage(
            STORAGE.settings,
            {
                ...DEFAULT_SETTINGS
            }
        );

    }

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getDateString(date = new Date()) {

    const d = new Date(date);

    if (isNaN(d.getTime())) {

        return "";

    }

    const year = d.getFullYear();

    const month = String(
        d.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        d.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function getMonthString(date = new Date()) {

    const d = new Date(date);

    if (isNaN(d.getTime())) {

        return "";

    }

    const year = d.getFullYear();

    const month = String(
        d.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;

}


/* =========================================================
   NUMBER HELPERS
========================================================= */

function toNumber(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {

        return 0;

    }

    return number;

}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(amount) {

    const settings = AppData.settings || DEFAULT_SETTINGS;

    const currency =
        settings.currency || "₹";

    const number = toNumber(amount);

    return `${currency}${number.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )}`;

}


/* =========================================================
   TRANSACTION HELPERS
========================================================= */

function getAllTransactions() {

    const transactions =
        readStorage(
            STORAGE.transactions,
            []
        );

    return Array.isArray(transactions)
        ? transactions
        : [];

}


function getIncomeTransactions() {

    return getAllTransactions().filter(
        transaction =>
            transaction &&
            transaction.type === "income"
    );

}


function getExpenseTransactions() {

    return getAllTransactions().filter(
        transaction =>
            transaction &&
            transaction.type === "expense"
    );

}


function getTransactionsForDate(date) {

    const targetDate =
        getDateString(date);

    return getAllTransactions().filter(
        transaction =>
            transaction &&
            transaction.date === targetDate
    );

}


function getTransactionsForMonth(month) {

    const targetMonth =
        month || getMonthString();

    return getAllTransactions().filter(
        transaction =>
            transaction &&
            typeof transaction.date === "string" &&
            transaction.date.substring(0, 7) === targetMonth
    );

}


/* =========================================================
   TOTAL CALCULATIONS
========================================================= */

function calculateIncome(transactions) {

    if (!Array.isArray(transactions)) {

        return 0;

    }

    return transactions
        .filter(
            transaction =>
                transaction &&
                transaction.type === "income"
        )
        .reduce(
            (total, transaction) =>
                total + toNumber(transaction.amount),
            0
        );

}


function calculateExpense(transactions) {

    if (!Array.isArray(transactions)) {

        return 0;

    }

    return transactions
        .filter(
            transaction =>
                transaction &&
                transaction.type === "expense"
        )
        .reduce(
            (total, transaction) =>
                total + toNumber(transaction.amount),
            0
        );

}


/* =========================================================
   BUDGET HELPERS
========================================================= */

function getBudgetForCategory(
    categoryId,
    month = getMonthString()
) {

    const budgets =
        readStorage(
            STORAGE.budgets,
            []
        );

    if (!Array.isArray(budgets)) {

        return null;

    }

    return budgets.find(
        budget =>
            budget &&
            budget.categoryId === categoryId &&
            budget.month === month
    ) || null;

}


function getExpenseForCategory(
    categoryId,
    month = getMonthString()
) {

    const transactions =
        getTransactionsForMonth(month);

    return transactions
        .filter(
            transaction =>
                transaction &&
                transaction.type === "expense" &&
                transaction.categoryId === categoryId
        )
        .reduce(
            (total, transaction) =>
                total + toNumber(transaction.amount),
            0
        );

}


function getTotalBudget(
    month = getMonthString()
) {

    const budgets =
        readStorage(
            STORAGE.budgets,
            []
        );

    if (!Array.isArray(budgets)) {

        return 0;

    }

    return budgets
        .filter(
            budget =>
                budget &&
                budget.month === month
        )
        .reduce(
            (total, budget) =>
                total + toNumber(budget.amount),
            0
        );

}


function getTotalExpense(
    month = getMonthString()
) {

    return calculateExpense(
        getTransactionsForMonth(month)
    );

}


/* =========================================================
   ACCOUNT BALANCE
========================================================= */

function getAccountBalance(accountId) {

    const accounts =
        readStorage(
            STORAGE.accounts,
            []
        );

    const account =
        accounts.find(
            item =>
                item &&
                item.id === accountId
        );

    if (!account) {

        return 0;

    }

    const transactions =
        getAllTransactions();

    const income =
        transactions
            .filter(
                transaction =>
                    transaction &&
                    transaction.type === "income" &&
                    transaction.accountId === accountId
            )
            .reduce(
                (total, transaction) =>
                    total + toNumber(transaction.amount),
                0
            );

    const expense =
        transactions
            .filter(
                transaction =>
                    transaction &&
                    transaction.type === "expense" &&
                    transaction.accountId === accountId
            )
            .reduce(
                (total, transaction) =>
                    total + toNumber(transaction.amount),
                0
            );

    return (
        toNumber(account.openingBalance) +
        income -
        expense
    );

}


/* =========================================================
   ACCOUNT SUMMARY
========================================================= */

function getAccountsSummary() {

    const accounts =
        readStorage(
            STORAGE.accounts,
            []
        );

    const transactions =
        getAllTransactions();

    let opening = 0;
    let income = 0;
    let expense = 0;

    accounts.forEach(account => {

        if (!account) {

            return;

        }

        opening +=
            toNumber(account.openingBalance);

    });


    transactions.forEach(transaction => {

        if (!transaction) {

            return;

        }

        const amount =
            toNumber(transaction.amount);

        if (transaction.type === "income") {

            income += amount;

        }

        if (transaction.type === "expense") {

            expense += amount;

        }

    });


    return {

        openingBalance: opening,

        income: income,

        expense: expense,

        balance:
            opening +
            income -
            expense

    };

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const today =
        getDateString();

    const month =
        getMonthString();


    /* -----------------------------------------------------
       Today's transactions
    ----------------------------------------------------- */

    const todayTransactions =
        getTransactionsForDate(today);


    const todayIncome =
        calculateIncome(
            todayTransactions
        );


    const todayExpense =
        calculateExpense(
            todayTransactions
        );


    const todayBalance =
        todayIncome -
        todayExpense;


    /* -----------------------------------------------------
       Monthly transactions
    ----------------------------------------------------- */

    const monthTransactions =
        getTransactionsForMonth(month);


    const monthIncome =
        calculateIncome(
            monthTransactions
        );


    const monthExpense =
        calculateExpense(
            monthTransactions
        );


    const monthBalance =
        monthIncome -
        monthExpense;


    /* -----------------------------------------------------
       Dashboard text
    ----------------------------------------------------- */

    setText(
        "todayIncome",
        formatCurrency(todayIncome)
    );

    setText(
        "todayExpense",
        formatCurrency(todayExpense)
    );

    setText(
        "todayBalance",
        formatCurrency(todayBalance)
    );


    setText(
        "monthlyIncome",
        formatCurrency(monthIncome)
    );

    setText(
        "monthlyExpense",
        formatCurrency(monthExpense)
    );

    setText(
        "monthlyBalance",
        formatCurrency(monthBalance)
    );


    /* -----------------------------------------------------
       Other dashboard sections
    ----------------------------------------------------- */

    updateBudgetDashboard();

    updateCategoryComparison();

}


/* =========================================================
   BUDGET DASHBOARD
========================================================= */

function updateBudgetDashboard() {

    const month =
        getMonthString();


    const totalBudget =
        getTotalBudget(month);


    const totalExpense =
        getTotalExpense(month);


    const remaining =
        totalBudget -
        totalExpense;


    let percentage = 0;


    if (totalBudget > 0) {

        percentage =
            (totalExpense / totalBudget) * 100;

    }


    setText(
        "dashboardBudget",
        formatCurrency(totalBudget)
    );


    setText(
        "dashboardBudgetExpense",
        formatCurrency(totalExpense)
    );


    setText(
        "dashboardBudgetRemaining",
        formatCurrency(remaining)
    );


    setText(
        "dashboardBudgetPercent",
        `${Math.round(percentage)}%`
    );


    const progress =
        document.getElementById(
            "dashboardBudgetProgress"
        );


    if (progress) {

        progress.style.width =
            `${Math.min(
                Math.max(percentage, 0),
                100
            )}%`;

    }

}


/* =========================================================
   CATEGORY COMPARISON
========================================================= */

function updateCategoryComparison() {

    const container =
        document.getElementById(
            "categoryComparison"
        );

    if (!container) {

        return;

    }


    const month =
        getMonthString();


    const budgets =
        readStorage(
            STORAGE.budgets,
            []
        );


    const monthBudgets =
        Array.isArray(budgets)
            ? budgets.filter(
                budget =>
                    budget &&
                    budget.month === month
            )
            : [];


    if (
        monthBudgets.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                या महिन्यासाठी Budget उपलब्ध नाही.
            </div>
        `;

        return;

    }


    container.innerHTML =
        monthBudgets.map(
            budget => {

                const category =
                    EXPENSE_CATEGORIES.find(
                        item =>
                            item.id ===
                            budget.categoryId
                    );


                const categoryName =
                    category
                        ? category.name
                        : budget.categoryId;


                const budgetAmount =
                    toNumber(
                        budget.amount
                    );


                const actualExpense =
                    getExpenseForCategory(
                        budget.categoryId,
                        month
                    );


                let percentage = 0;


                if (budgetAmount > 0) {

                    percentage =
                        (
                            actualExpense /
                            budgetAmount
                        ) * 100;

                }


                const remaining =
                    budgetAmount -
                    actualExpense;


                return `

                    <div class="comparison-card">

                        <div class="comparison-header">

                            <strong>
                                ${escapeHtml(categoryName)}
                            </strong>

                            <span>
                                ${Math.round(
                                    percentage
                                )}%
                            </span>

                        </div>

                        <div class="comparison-values">

                            <span>
                                Budget:
                                ${formatCurrency(
                                    budgetAmount
                                )}
                            </span>

                            <span>
                                खर्च:
                                ${formatCurrency(
                                    actualExpense
                                )}
                            </span>

                            <span>
                                बाकी:
                                ${formatCurrency(
                                    remaining
                                )}
                            </span>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ACCOUNT LIST
   ---------------------------------------------------------
   Kept as a common helper for dashboard/index.
   Account management itself belongs to accounts.js.
========================================================= */

function renderAccounts() {

    const container =
        document.getElementById(
            "accountsList"
        );

    if (!container) {

        return;

    }


    const accounts =
        readStorage(
            STORAGE.accounts,
            []
        );


    if (
        !Array.isArray(accounts) ||
        accounts.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                कोणतेही खाते उपलब्ध नाही.
            </div>
        `;

        return;

    }


    container.innerHTML =
        accounts.map(
            account => {

                const balance =
                    getAccountBalance(
                        account.id
                    );


                return `

                    <div class="account-card">

                        <div class="account-card-header">

                            <strong>
                                ${escapeHtml(
                                    account.name || ""
                                )}
                            </strong>

                            <span>
                                ${formatCurrency(
                                    balance
                                )}
                            </span>

                        </div>

                        <div class="account-card-info">

                            Opening:
                            ${formatCurrency(
                                account.openingBalance
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ID GENERATOR
========================================================= */

function generateId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(pageName) {

    if (!pageName) {

        return;

    }


    const targetPage =
        PAGE_FILES[pageName];


    if (!targetPage) {

        console.warn(
            "Unknown page:",
            pageName
        );

        return;

    }


    /*
       Dashboard is index.html itself.
       If already on dashboard, simply refresh
       dashboard data.
    */

    if (pageName === "dashboard") {

        const currentFile =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (
            currentFile === "" ||
            currentFile === "index.html"
        ) {

            updateDashboard();

            closeSideMenu();

            return;

        }

    }


    /*
       All other modules are separate HTML files.
    */

    window.location.href =
        targetPage;

}


/* =========================================================
   SIDE MENU
========================================================= */

function openSideMenu() {

    const sideMenu =
        document.getElementById(
            "sideMenu"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );


    if (sideMenu) {

        sideMenu.classList.add(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "show"
        );

    }

}


function closeSideMenu() {

    const sideMenu =
        document.getElementById(
            "sideMenu"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );


    if (sideMenu) {

        sideMenu.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   CURRENT DATE
========================================================= */

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {

        return;

    }


    const now =
        new Date();


    const options = {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    };


    try {

        element.textContent =
            now.toLocaleDateString(
                "mr-IN",
                options
            );

    } catch (error) {

        element.textContent =
            getDateString();

    }

}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.textContent =
        value ?? "";

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    /* -----------------------------------------------------
       Menu Button
    ----------------------------------------------------- */

    const menuBtn =
        document.getElementById(
            "menuBtn"
        );


    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            openSideMenu
        );

    }


    /* -----------------------------------------------------
       Close Menu
    ----------------------------------------------------- */

    const closeMenu =
        document.getElementById(
            "closeMenu"
        );


    if (closeMenu) {

        closeMenu.addEventListener(
            "click",
            closeSideMenu
        );

    }


    /* -----------------------------------------------------
       Menu Overlay
    ----------------------------------------------------- */

    const menuOverlay =
        document.getElementById(
            "menuOverlay"
        );


    if (menuOverlay) {

        menuOverlay.addEventListener(
            "click",
            closeSideMenu
        );

    }


    /* -----------------------------------------------------
       Navigation
       Works on every HTML page.
    ----------------------------------------------------- */

    const navigationItems =
        document.querySelectorAll(
            "[data-page]"
        );


    navigationItems.forEach(
        element => {

            element.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    const page =
                        this.dataset.page;


                    openPage(page);

                }
            );

        }
    );


    /* -----------------------------------------------------
       ESC Key
    ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeSideMenu();

            }

        }
    );


    /* -----------------------------------------------------
       Storage Change
       Same browser tab/page refresh support.
    ----------------------------------------------------- */

    window.addEventListener(
        "storage",
        function(event) {

            if (
                event.key ===
                    STORAGE.transactions ||
                event.key ===
                    STORAGE.accounts ||
                event.key ===
                    STORAGE.budgets
            ) {

                updateDashboard();

                renderAccounts();

            }

        }
    );


    /* -----------------------------------------------------
       Central Transaction Change Event
    ----------------------------------------------------- */

    window.addEventListener(
        "transactionsChanged",
        function() {

            updateDashboard();

            renderAccounts();

        }
    );

}


/* =========================================================
   APP START
========================================================= */

function startApp() {

    try {

        initializeAppData();

        setupEventListeners();

        updateCurrentDate();

        /*
           These functions safely do nothing
           when their elements are not present.
        */

        renderAccounts();

        updateDashboard();

    } catch (error) {

        console.error(
            "Application startup error:",
            error
        );

    }

}


/* =========================================================
   GLOBAL COMMON API
========================================================= */

window.RJKA_App = {

    version: APP_VERSION,

    storage: STORAGE,

    pageFiles: PAGE_FILES,

    expenseCategories:
        EXPENSE_CATEGORIES,

    defaultAccounts:
        DEFAULT_ACCOUNTS,

    defaultSettings:
        DEFAULT_SETTINGS,

    readStorage,

    writeStorage,

    initializeAppData,

    getDateString,

    getMonthString,

    toNumber,

    formatCurrency,

    getAllTransactions,

    getIncomeTransactions,

    getExpenseTransactions,

    getTransactionsForDate,

    getTransactionsForMonth,

    calculateIncome,

    calculateExpense,

    getBudgetForCategory,

    getExpenseForCategory,

    getTotalBudget,

    getTotalExpense,

    getAccountBalance,

    getAccountsSummary,

    updateDashboard,

    updateBudgetDashboard,

    updateCategoryComparison,

    renderAccounts,

    generateId,

    openPage,

    openSideMenu,

    closeSideMenu,

    updateCurrentDate,

    setText,

    escapeHtml

};


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}


/* =========================================================
   END OF app.js
========================================================= */
