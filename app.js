/* =========================================================
   रोजचा जमा खर्च अहवाल
   NEW APP FOUNDATION

   VERSION:
   CENTRAL DATA SYSTEM - V1

   IMPORTANT:
   ---------------------------------------------------------
   हा नवीन app आहे.
   जुन्या app मधील कोणतेही localStorage keys वापरलेले नाहीत.
========================================================= */


/* =========================================================
   1. CENTRAL STORAGE CONFIGURATION
========================================================= */

const APP_VERSION = "1.0.0";

const STORAGE = {

    transactions:
        "RJKA_v1_transactions",

    accounts:
        "RJKA_v1_accounts",

    budgets:
        "RJKA_v1_budgets",

    lending:
        "RJKA_v1_lending",

    workplan:
        "RJKA_v1_workplan",

    settings:
        "RJKA_v1_settings"
};


/* =========================================================
   2. MASTER EXPENSE CATEGORIES
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
   3. DEFAULT ACCOUNTS
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
   4. DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    appVersion:
        APP_VERSION,

    currency:
        "₹",

    firstDayOfWeek:
        "monday",

    financialYearStartMonth:
        4
};


/* =========================================================
   5. STORAGE HELPERS
========================================================= */

function readStorage(key, fallback) {

    try {

        const raw =
            localStorage.getItem(key);

        if (!raw) {
            return fallback;
        }

        return JSON.parse(raw);

    } catch (error) {

        console.error(
            "Storage read error:",
            key,
            error
        );

        return fallback;
    }
}


function writeStorage(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
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
   6. CENTRAL DATA OBJECT
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
            value
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
            value
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
            value
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
            value
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
            value
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
            value
        );
    }

};


/* =========================================================
   7. INITIALIZE APP DATA
========================================================= */

function initializeAppData() {

    /*
     * IMPORTANT:
     * Existing new-app data is not overwritten.
     */

    const existingAccounts =
        localStorage.getItem(
            STORAGE.accounts
        );


    if (!existingAccounts) {

        AppData.accounts =
            DEFAULT_ACCOUNTS.map(
                account => ({
                    ...account
                })
            );
    }


    const existingTransactions =
        localStorage.getItem(
            STORAGE.transactions
        );

    if (!existingTransactions) {

        AppData.transactions = [];
    }


    const existingBudgets =
        localStorage.getItem(
            STORAGE.budgets
        );

    if (!existingBudgets) {

        AppData.budgets = [];
    }


    const existingLending =
        localStorage.getItem(
            STORAGE.lending
        );

    if (!existingLending) {

        AppData.lending = [];
    }


    const existingWorkplan =
        localStorage.getItem(
            STORAGE.workplan
        );

    if (!existingWorkplan) {

        AppData.workplan = [];
    }


    const existingSettings =
        localStorage.getItem(
            STORAGE.settings
        );

    if (!existingSettings) {

        AppData.settings =
            DEFAULT_SETTINGS;
    }

}


/* =========================================================
   8. DATE HELPERS
========================================================= */

function getDateString(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getMonthString(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


/* =========================================================
   9. NUMBER HELPERS
========================================================= */

function toNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


function formatCurrency(amount) {

    const value =
        toNumber(amount);

    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   10. TRANSACTION HELPERS
========================================================= */

function getIncomeTransactions() {

    return AppData.transactions.filter(
        transaction =>
            transaction.type === "income"
    );
}


function getExpenseTransactions() {

    return AppData.transactions.filter(
        transaction =>
            transaction.type === "expense"
    );
}


function getTransactionsForDate(date) {

    return AppData.transactions.filter(
        transaction =>
            transaction.date === date
    );
}


function getTransactionsForMonth(month) {

    return AppData.transactions.filter(
        transaction =>
            transaction.date &&
            transaction.date.startsWith(month)
    );
}


/* =========================================================
   11. TOTAL CALCULATIONS
========================================================= */

function calculateIncome(transactions) {

    return transactions.reduce(
        (total, transaction) => {

            if (
                transaction.type ===
                "income"
            ) {

                return total +
                    toNumber(
                        transaction.amount
                    );
            }

            return total;

        },
        0
    );
}


function calculateExpense(transactions) {

    return transactions.reduce(
        (total, transaction) => {

            if (
                transaction.type ===
                "expense"
            ) {

                return total +
                    toNumber(
                        transaction.amount
                    );
            }

            return total;

        },
        0
    );
}


/* =========================================================
   12. BUDGET HELPERS
========================================================= */

function getBudgetForCategory(
    categoryId,
    month
) {

    const budget =
        AppData.budgets.find(
            item =>
                item.month === month &&
                item.categoryId === categoryId
        );

    return budget
        ? toNumber(budget.amount)
        : 0;
}


function getExpenseForCategory(
    categoryId,
    month
) {

    const transactions =
        getTransactionsForMonth(
            month
        );

    return transactions.reduce(
        (total, transaction) => {

            if (
                transaction.type ===
                    "expense" &&
                transaction.categoryId ===
                    categoryId
            ) {

                return total +
                    toNumber(
                        transaction.amount
                    );
            }

            return total;

        },
        0
    );
}


function getTotalBudget(month) {

    return EXPENSE_CATEGORIES.reduce(
        (total, category) => {

            return total +
                getBudgetForCategory(
                    category.id,
                    month
                );

        },
        0
    );
}


function getTotalExpense(month) {

    return EXPENSE_CATEGORIES.reduce(
        (total, category) => {

            return total +
                getExpenseForCategory(
                    category.id,
                    month
                );

        },
        0
    );
}


/* =========================================================
   13. DASHBOARD
========================================================= */

function updateDashboard() {

    const today =
        getDateString();

    const currentMonth =
        getMonthString();


    const todayTransactions =
        getTransactionsForDate(
            today
        );


    const monthTransactions =
        getTransactionsForMonth(
            currentMonth
        );


    const todayIncome =
        calculateIncome(
            todayTransactions
        );


    const todayExpense =
        calculateExpense(
            todayTransactions
        );


    const monthIncome =
        calculateIncome(
            monthTransactions
        );


    const monthExpense =
        calculateExpense(
            monthTransactions
        );


    const todayBalance =
        todayIncome -
        todayExpense;


    const monthBalance =
        monthIncome -
        monthExpense;


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
        "monthIncome",
        formatCurrency(monthIncome)
    );


    setText(
        "monthExpense",
        formatCurrency(monthExpense)
    );


    setText(
        "monthBalance",
        formatCurrency(monthBalance)
    );


    updateBudgetDashboard(
        currentMonth
    );


    updateCategoryComparison(
        currentMonth
    );


    updateCurrentDate();
}


/* =========================================================
   14. BUDGET DASHBOARD
========================================================= */

function updateBudgetDashboard(month) {

    const totalBudget =
        getTotalBudget(month);


    const totalExpense =
        getTotalExpense(month);


    const remaining =
        totalBudget -
        totalExpense;


    let percent = 0;


    if (totalBudget > 0) {

        percent =
            (totalExpense /
                totalBudget) *
            100;
    }


    const displayPercent =
        Math.min(
            Math.max(percent, 0),
            100
        );


    setText(
        "totalBudget",
        formatCurrency(totalBudget)
    );


    setText(
        "totalBudgetExpense",
        formatCurrency(totalExpense)
    );


    setText(
        "totalBudgetRemaining",
        formatCurrency(remaining)
    );


    setText(
        "totalBudgetPercent",
        `${percent.toFixed(1)}% used`
    );


    const progress =
        document.getElementById(
            "totalBudgetProgress"
        );


    if (progress) {

        progress.style.width =
            `${displayPercent}%`;
    }

}


/* =========================================================
   15. CATEGORY COMPARISON
========================================================= */

function updateCategoryComparison(month) {

    const container =
        document.getElementById(
            "dashboardCategoryComparison"
        );


    if (!container) {
        return;
    }


    const hasBudget =
        EXPENSE_CATEGORIES.some(
            category =>
                getBudgetForCategory(
                    category.id,
                    month
                ) > 0
        );


    const hasExpense =
        EXPENSE_CATEGORIES.some(
            category =>
                getExpenseForCategory(
                    category.id,
                    month
                ) > 0
        );


    if (!hasBudget && !hasExpense) {

        container.innerHTML = `
            <div class="empty-state">
                या महिन्यासाठी Budget किंवा Expense data उपलब्ध नाही.
            </div>
        `;

        return;
    }


    container.innerHTML =
        EXPENSE_CATEGORIES
            .map(category => {

                const budget =
                    getBudgetForCategory(
                        category.id,
                        month
                    );


                const expense =
                    getExpenseForCategory(
                        category.id,
                        month
                    );


                if (
                    budget === 0 &&
                    expense === 0
                ) {

                    return "";
                }


                const remaining =
                    budget -
                    expense;


                const percent =
                    budget > 0
                        ? (expense / budget) *
                          100
                        : 0;


                const displayPercent =
                    Math.min(
                        Math.max(
                            percent,
                            0
                        ),
                        100
                    );


                let status =
                    "Budget मध्ये";


                if (
                    budget > 0 &&
                    expense > budget
                ) {

                    status =
                        "Budget पेक्षा जास्त";
                }


                if (
                    budget === 0 &&
                    expense > 0
                ) {

                    status =
                        "Budget सेट नाही";
                }


                return `

                    <div class="comparison-card">

                        <div class="comparison-header">

                            <div class="category-name">
                                ${escapeHtml(
                                    category.name
                                )}
                            </div>

                            <div class="category-status">
                                ${status}
                            </div>

                        </div>


                        <div class="comparison-numbers">

                            <div class="comparison-number">

                                <span>
                                    Budget
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        budget
                                    )}
                                </strong>

                            </div>


                            <div class="comparison-number">

                                <span>
                                    Expense
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        expense
                                    )}
                                </strong>

                            </div>


                            <div class="comparison-number">

                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    ${formatCurrency(
                                        remaining
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div class="category-progress">

                            <div
                                class="category-progress-bar"
                                style="width:${displayPercent}%">
                            </div>

                        </div>

                    </div>

                `;

            })
            .join("");


}


/* =========================================================
   16. ACCOUNTS
========================================================= */

function getAccountBalance(accountId) {

    const account =
        AppData.accounts.find(
            item =>
                item.id === accountId
        );


    if (!account) {
        return 0;
    }


    const openingBalance =
        toNumber(
            account.openingBalance
        );


    const transactions =
        AppData.transactions.filter(
            transaction =>
                transaction.accountId ===
                accountId
        );


    let balance =
        openingBalance;


    transactions.forEach(
        transaction => {

            const amount =
                toNumber(
                    transaction.amount
                );


            if (
                transaction.type ===
                "income"
            ) {

                balance += amount;

            } else if (
                transaction.type ===
                "expense"
            ) {

                balance -= amount;
            }

        }
    );


    return balance;
}


function renderAccounts() {

    const container =
        document.getElementById(
            "accountsList"
        );


    if (!container) {
        return;
    }


    const accounts =
        AppData.accounts;


    if (!accounts.length) {

        container.innerHTML = `
            <div class="empty-state">
                कोणतेही account उपलब्ध नाही.
            </div>
        `;

        return;
    }


    container.innerHTML =
        accounts
            .map(account => {

                const balance =
                    getAccountBalance(
                        account.id
                    );


                let icon =
                    "🏦";


                if (
                    account.name
                        .toLowerCase() ===
                    "upi"
                ) {

                    icon =
                        "📱";

                } else if (
                    account.name
                        .toLowerCase() ===
                    "cash"
                ) {

                    icon =
                        "💵";
                }


                return `

                    <div class="account-card">

                        <div class="account-icon">
                            ${icon}
                        </div>

                        <div class="account-name">
                            ${escapeHtml(
                                account.name
                            )}
                        </div>

                        <div class="account-balance-label">
                            Current Balance
                        </div>

                        <div class="account-balance">
                            ${formatCurrency(
                                balance
                            )}
                        </div>

                    </div>

                `;

            })
            .join("");
}


/* =========================================================
   17. ADD ACCOUNT
========================================================= */

function addAccount(
    name,
    openingBalance
) {

    const cleanName =
        String(name || "")
            .trim();


    if (!cleanName) {

        alert(
            "Account name टाका."
        );

        return false;
    }


    const duplicate =
        AppData.accounts.some(
            account =>
                account.name
                    .toLowerCase() ===
                cleanName.toLowerCase()
        );


    if (duplicate) {

        alert(
            "हे Account आधीपासून उपलब्ध आहे."
        );

        return false;
    }


    const account = {

        id:
            generateId(
                "account"
            ),

        name:
            cleanName,

        type:
            "custom",

        openingBalance:
            toNumber(
                openingBalance
            ),

        createdAt:
            new Date().toISOString()
    };


    const accounts =
        AppData.accounts;


    accounts.push(account);


    AppData.accounts =
        accounts;


    renderAccounts();


    return true;
}


/* =========================================================
   18. ID GENERATOR
========================================================= */

function generateId(prefix) {

    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   19. NAVIGATION
========================================================= */

function openPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(page => {

        page.classList.remove(
            "active-page"
        );

    });


    const target =
        document.getElementById(
            `${pageName}Page`
        );


    if (target) {

        target.classList.add(
            "active-page"
        );
    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(item => {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.page ===
            pageName
        ) {

            item.classList.add(
                "active"
            );
        }

    });


    closeSideMenu();


    if (
        pageName ===
        "dashboard"
    ) {

        updateDashboard();
    }


    if (
        pageName ===
        "accounts"
    ) {

        renderAccounts();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   20. SIDE MENU
========================================================= */

function openSideMenu() {

    const menu =
        document.getElementById(
            "sideMenu"
        );


    const overlay =
        document.getElementById(
            "menuOverlay"
        );


    menu.classList.add(
        "open"
    );


    overlay.classList.add(
        "show"
    );
}


function closeSideMenu() {

    const menu =
        document.getElementById(
            "sideMenu"
        );


    const overlay =
        document.getElementById(
            "menuOverlay"
        );


    menu.classList.remove(
        "open"
    );


    overlay.classList.remove(
        "show"
    );
}


/* =========================================================
   21. ACCOUNT MODAL
========================================================= */

function openAccountModal() {

    const modal =
        document.getElementById(
            "accountModal"
        );


    modal.classList.add(
        "show"
    );


    document
        .getElementById(
            "accountName"
        )
        .focus();
}


function closeAccountModal() {

    const modal =
        document.getElementById(
            "accountModal"
        );


    modal.classList.remove(
        "show"
    );


    document
        .getElementById(
            "accountForm"
        )
        .reset();


    document
        .getElementById(
            "openingBalance"
        )
        .value = "0";
}


/* =========================================================
   22. CURRENT DATE
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


    const formatted =
        now.toLocaleDateString(
            "mr-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    element.textContent =
        formatted;
}


/* =========================================================
   23. TEXT HELPER
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   24. HTML ESCAPE
========================================================= */

function escapeHtml(value) {

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
   25. EVENT LISTENERS
========================================================= */

function setupEventListeners() {


    /* MENU */

    document
        .getElementById("menuBtn")
        .addEventListener(
            "click",
            openSideMenu
        );


    document
        .getElementById("closeMenu")
        .addEventListener(
            "click",
            closeSideMenu
        );


    document
        .getElementById("menuOverlay")
        .addEventListener(
            "click",
            closeSideMenu
        );


    /* NAVIGATION */

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    openPage(
                        element.dataset.page
                    );

                }
            );

        });


    /* ACCOUNT */

    document
        .getElementById(
            "addAccountBtn"
        )
        .addEventListener(
            "click",
            openAccountModal
        );


    document
        .getElementById(
            "closeAccountModal"
        )
        .addEventListener(
            "click",
            closeAccountModal
        );


    document
        .getElementById(
            "cancelAccount"
        )
        .addEventListener(
            "click",
            closeAccountModal
        );


    document
        .getElementById(
            "accountModal"
        )
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "accountModal"
                ) {

                    closeAccountModal();
                }

            }
        );


    document
        .getElementById(
            "accountForm"
        )
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "accountName"
                        )
                        .value;


                const openingBalance =
                    document
                        .getElementById(
                            "openingBalance"
                        )
                        .value;


                const success =
                    addAccount(
                        name,
                        openingBalance
                    );


                if (success) {

                    closeAccountModal();

                    alert(
                        "Account successfully added."
                    );
                }

            }
        );

}


/* =========================================================
   26. APP START
========================================================= */

function startApp() {

    initializeAppData();

    setupEventListeners();

    updateCurrentDate();

    renderAccounts();

    updateDashboard();

}


/* =========================================================
   27. DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    startApp
);
