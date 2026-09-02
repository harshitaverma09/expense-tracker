let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let budgets =
    JSON.parse(localStorage.getItem("budgets")) || [];

let goals =
    JSON.parse(localStorage.getItem("goals")) || [];




const pages =
    document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".nav-btn");

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");



navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        showPage(page);

    });

});


document.querySelectorAll("[data-page-link]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showPage(button.dataset.pageLink);

        });

    });


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    document
        .getElementById(pageName)
        .classList.add("active-page");


    navButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });


    const titles = {

        dashboard: [
            "Dashboard",
            "Your financial overview"
        ],

        transactions: [
            "Transactions",
            "Manage your financial activity"
        ],

        budgets: [
            "Budgets",
            "Plan and control your spending"
        ],

        reports: [
            "Reports",
            "Understand your financial habits"
        ],

        goals: [
            "Savings Goals",
            "Build your future"
        ],

        sheets: [
            "Financial Sheets",
            "Spreadsheet-style records"
        ]

    };


    pageTitle.textContent =
        titles[pageName][0];

    pageSubtitle.textContent =
        titles[pageName][1];

}


// ================= MODALS =================

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");

}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal(button.dataset.close);

        });

    });


document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.classList.remove("show");

            }

        });

    });


// ================= TRANSACTION =================

const transactionForm =
    document.getElementById("transactionForm");


document
    .getElementById("quickAddBtn")
    .addEventListener("click", () => {

        openModal("transactionModal");

    });


document
    .getElementById("addTransactionBtn")
    .addEventListener("click", () => {

        openModal("transactionModal");

    });


transactionForm.addEventListener("submit", event => {

    event.preventDefault();


    const transaction = {

        id: Date.now(),

        description:
            document
                .getElementById("description")
                .value
                .trim(),

        amount:
            Number(
                document
                    .getElementById("amount")
                    .value
            ),

        type:
            document
                .getElementById("type")
                .value,

        category:
            document
                .getElementById("category")
                .value,

        date:
            document
                .getElementById("transactionDate")
                .value

    };


    transactions.push(transaction);


    saveData();


    transactionForm.reset();


    closeModal("transactionModal");


    updateAll();

});


// ================= DELETE =================

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveData();

    updateAll();

}


// ================= CURRENCY =================

function currency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


// ================= DASHBOARD =================

function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });


    const balance =
        income - expense;


    const rate =
        income > 0
            ? ((income - expense) / income) * 100
            : 0;


    document.getElementById("dashBalance")
        .textContent = currency(balance);


    document.getElementById("dashIncome")
        .textContent = currency(income);


    document.getElementById("dashExpense")
        .textContent = currency(expense);


    document.getElementById("savingsRate")
        .textContent =
        Math.max(0, rate).toFixed(0) + "%";


    renderRecentTransactions();

    renderCategoryChart();

    renderDashboardBudgets();

}


// ================= RECENT TRANSACTIONS =================

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    const recent =
        [...transactions]
            .reverse()
            .slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            `<div class="empty">
                No transactions yet.
            </div>`;

        return;

    }


    container.innerHTML =
        recent.map(transaction => {

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            return `

                <div class="transaction-row">

                    <div class="transaction-left">

                        <div class="transaction-icon">
                            ${getCategoryIcon(transaction.category)}
                        </div>

                        <div>

                            <div class="transaction-name">
                                ${escapeHTML(transaction.description)}
                            </div>

                            <div class="transaction-date">
                                ${transaction.category}
                                •
                                ${transaction.date || "Today"}
                            </div>

                        </div>

                    </div>


                    <div>

                        <span class="${
                            transaction.type === "income"
                                ? "income-text"
                                : "expense-text"
                        }">

                            ${sign}${currency(transaction.amount)}

                        </span>


                        <button
                            class="delete-small"
                            onclick="deleteTransaction(${transaction.id})">

                            ×

                        </button>

                    </div>

                </div>

            `;

        })
        .join("");

}


// ================= TRANSACTION TABLE =================

function renderTransactions() {

    const container =
        document.getElementById(
            "transactionTable"
        );


    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const type =
        document
            .getElementById("filterType")
            .value;


    const category =
        document
            .getElementById("filterCategory")
            .value;


    const filtered =
        transactions.filter(transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "all" ||
                transaction.type === type;


            const matchesCategory =
                category === "all" ||
                transaction.category === category;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    if (filtered.length === 0) {

        container.innerHTML =
            `<div class="empty">
                No transactions found.
            </div>`;

        return;

    }


    container.innerHTML = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Action</th>

                    </tr>

                </thead>


                <tbody>

                    ${filtered
                        .slice()
                        .reverse()
                        .map(transaction => `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    transaction.description
                                )}
                            </td>

                            <td>
                                ${transaction.category}
                            </td>

                            <td>
                                ${transaction.type}
                            </td>

                            <td>
                                ${transaction.date || "-"}
                            </td>

                            <td class="${
                                transaction.type === "income"
                                    ? "income-text"
                                    : "expense-text"
                            }">

                                ${
                                    transaction.type === "income"
                                        ? "+"
                                        : "-"
                                }

                                ${currency(transaction.amount)}

                            </td>

                            <td>

                                <button
                                    class="delete-small"
                                    onclick="deleteTransaction(${transaction.id})">

                                    Delete

                                </button>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


// Filters

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderTransactions
    );


document
    .getElementById("filterType")
    .addEventListener(
        "change",
        renderTransactions
    );


document
    .getElementById("filterCategory")
    .addEventListener(
        "change",
        renderTransactions
    );


// ================= CATEGORY CHART =================

function getCategoryTotals() {

    const totals = {};


    transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .forEach(transaction => {

            totals[transaction.category] =
                (totals[transaction.category] || 0)
                + transaction.amount;

        });


    return totals;

}


function renderCategoryChart() {

    const container =
        document.getElementById(
            "categoryChart"
        );


    const totals =
        getCategoryTotals();


    const values =
        Object.values(totals);


    const max =
        Math.max(...values, 1);


    if (values.length === 0) {

        container.innerHTML =
            `<div class="empty">
                No expense data yet.
            </div>`;

        return;

    }


    container.innerHTML =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {

                const width =
                    (amount / max) * 100;


                return `

                    <div class="chart-row">

                        <span>
                            ${category}
                        </span>

                        <div class="chart-bar">

                            <div
                                class="chart-fill"
                                style="width:${width}%">
                            </div>

                        </div>

                        <strong>
                            ${currency(amount)}
                        </strong>

                    </div>

                `;

            })
            .join("");

}


// ================= BUDGETS =================

document
    .getElementById("addBudgetBtn")
    .addEventListener("click", () => {

        openModal("budgetModal");

    });


document
    .getElementById("budgetForm")
    .addEventListener("submit", event => {

        event.preventDefault();


        const category =
            document.getElementById(
                "budgetCategory"
            ).value;


        const amount =
            Number(
                document.getElementById(
                    "budgetAmount"
                ).value
            );


        budgets =
            budgets.filter(
                budget =>
                    budget.category !== category
            );


        budgets.push({

            id: Date.now(),

            category,

            amount

        });


        saveData();


        event.target.reset();


        closeModal("budgetModal");


        updateAll();

    });


function getCategoryExpense(category) {

    return transactions
        .filter(
            transaction =>
                transaction.type === "expense" &&
                transaction.category === category
        )
        .reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

}


function renderBudgets() {

    const container =
        document.getElementById(
            "budgetGrid"
        );


    if (budgets.length === 0) {

        container.innerHTML =
            `<div class="panel empty">
                No budgets created yet.
            </div>`;

        return;

    }


    container.innerHTML =
        budgets.map(budget => {

            const spent =
                getCategoryExpense(
                    budget.category
                );


            const percentage =
                Math.min(
                    (spent / budget.amount) * 100,
                    100
                );


            return `

                <div class="budget-card">

                    <div class="budget-top">

                        <div>

                            <h3>
                                ${getCategoryIcon(
                                    budget.category
                                )}
                                ${budget.category}
                            </h3>

                            <small>
                                Monthly Budget
                            </small>

                        </div>

                        <button
                            class="delete-small"
                            onclick="deleteBudget(${budget.id})">

                            ×

                        </button>

                    </div>


                    <div class="progress">

                        <div
                            class="progress-bar ${
                                percentage >= 90
                                    ? "progress-danger"
                                    : ""
                            }"
                            style="width:${percentage}%">
                        </div>

                    </div>


                    <div class="budget-info">

                        <span>
                            ${currency(spent)} spent
                        </span>

                        <span>
                            ${currency(budget.amount)} limit
                        </span>

                    </div>

                </div>

            `;

        })
        .join("");

}


function renderDashboardBudgets() {

    const container =
        document.getElementById(
            "dashboardBudgets"
        );


    if (budgets.length === 0) {

        container.innerHTML =
            `<div class="empty">
                Create a budget to see your progress.
            </div>`;

        return;

    }


    container.innerHTML =
        budgets.slice(0, 4)
            .map(budget => {

                const spent =
                    getCategoryExpense(
                        budget.category
                    );


                const percentage =
                    Math.min(
                        (spent / budget.amount) * 100,
                        100
                    );


                return `

                    <div class="chart-row">

                        <span>
                            ${budget.category}
                        </span>

                        <div class="chart-bar">

                            <div
                                class="chart-fill"
                                style="width:${percentage}%">
                            </div>

                        </div>

                        <strong>
                            ${percentage.toFixed(0)}%
                        </strong>

                    </div>

                `;

            })
            .join("");

}


function deleteBudget(id) {

    budgets =
        budgets.filter(
            budget =>
                budget.id !== id
        );


    saveData();

    updateAll();

}


// ================= REPORTS =================

function renderReports() {

    const chart =
        document.getElementById(
            "reportChart"
        );


    const totals =
        getCategoryTotals();


    const max =
        Math.max(
            ...Object.values(totals),
            1
        );


    chart.innerHTML =
        Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {

                const width =
                    (amount / max) * 100;


                return `

                    <div class="chart-row">

                        <span>
                            ${category}
                        </span>

                        <div class="chart-bar">

                            <div
                                class="chart-fill"
                                style="width:${width}%">
                            </div>

                        </div>

                        <strong>
                            ${currency(amount)}
                        </strong>

                    </div>

                `;

            })
            .join("");


    const income =
        transactions
            .filter(
                t => t.type === "income"
            )
            .reduce(
                (sum, t) =>
                    sum + t.amount,
                0
            );


    const expense =
        transactions
            .filter(
                t => t.type === "expense"
            )
            .reduce(
                (sum, t) =>
                    sum + t.amount,
                0
            );


    document.getElementById(
        "reportSummary"
    ).innerHTML = `

        <div class="summary-line">
            <span>Total Income</span>
            <strong class="income-text">
                ${currency(income)}
            </strong>
        </div>

        <div class="summary-line">
            <span>Total Expenses</span>
            <strong class="expense-text">
                ${currency(expense)}
            </strong>
        </div>

        <div class="summary-line">
            <span>Net Savings</span>
            <strong>
                ${currency(income - expense)}
            </strong>
        </div>

        <div class="summary-line">
            <span>Total Transactions</span>
            <strong>
                ${transactions.length}
            </strong>
        </div>

    `;

}


// ================= SAVINGS GOALS =================

document
    .getElementById("addGoalBtn")
    .addEventListener("click", () => {

        openModal("goalModal");

    });


document
    .getElementById("goalForm")
    .addEventListener("submit", event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "goalName"
            ).value.trim();


        const target =
            Number(
                document.getElementById(
                    "goalTarget"
                ).value
            );


        const saved =
            Number(
                document.getElementById(
                    "goalSaved"
                ).value
            );


        goals.push({

            id: Date.now(),

            name,

            target,

            saved

        });


        saveData();


        event.target.reset();


        closeModal("goalModal");


        updateAll();

    });


function renderGoals() {

    const container =
        document.getElementById(
            "goalGrid"
        );


    if (goals.length === 0) {

        container.innerHTML =
            `<div class="panel empty">
                No savings goals yet.
            </div>`;

        return;

    }


    container.innerHTML =
        goals.map(goal => {

            const percentage =
                Math.min(
                    (goal.saved / goal.target) * 100,
                    100
                );


            return `

                <div class="goal-card">

                    <div class="goal-icon">
                        🏆
                    </div>

                    <h3>
                        ${escapeHTML(goal.name)}
                    </h3>

                    <p class="goal-amount">
                        ${currency(goal.saved)}
                        /
                        ${currency(goal.target)}
                    </p>


                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>

                    </div>


                    <div class="budget-info">

                        <span>
                            ${percentage.toFixed(0)}%
                        </span>

                        <span>
                            ${currency(
                                Math.max(
                                    0,
                                    goal.target -
                                    goal.saved
                                )
                            )}
                            remaining
                        </span>

                    </div>


                    <button
                        class="delete-small"
                        onclick="deleteGoal(${goal.id})">

                        Delete Goal

                    </button>

                </div>

            `;

        })
        .join("");

}


function deleteGoal(id) {

    goals =
        goals.filter(
            goal =>
                goal.id !== id
        );


    saveData();

    updateAll();

}


// ================= SHEETS =================

document
    .querySelectorAll(".sheet-tab")
    .forEach(tab => {

        tab.addEventListener("click", () => {

            document
                .querySelectorAll(".sheet-tab")
                .forEach(t =>
                    t.classList.remove("active")
                );


            document
                .querySelectorAll(".sheet")
                .forEach(sheet =>
                    sheet.classList.remove(
                        "active-sheet"
                    )
                );


            tab.classList.add("active");


            document
                .getElementById(
                    tab.dataset.sheet
                )
                .classList.add(
                    "active-sheet"
                );

        });

    });


function renderSheets() {

    // EXPENSE SHEET

    document.getElementById(
        "expenseSheet"
    ).innerHTML = createSheet(
        transactions.filter(
            t => t.type === "expense"
        ),
        "Expense"
    );


    // INCOME SHEET

    document.getElementById(
        "incomeSheet"
    ).innerHTML = createSheet(
        transactions.filter(
            t => t.type === "income"
        ),
        "Income"
    );


    // BUDGET SHEET

    document.getElementById(
        "budgetSheet"
    ).innerHTML = `

        <table>

            <thead>

                <tr>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                </tr>

            </thead>

            <tbody>

                ${budgets.map(budget => {

                    const spent =
                        getCategoryExpense(
                            budget.category
                        );


                    return `

                        <tr>

                            <td>
                                ${budget.category}
                            </td>

                            <td>
                                ${currency(
                                    budget.amount
                                )}
                            </td>

                            <td>
                                ${currency(spent)}
                            </td>

                            <td>
                                ${currency(
                                    budget.amount -
                                    spent
                                )}
                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

    `;


    // GOAL SHEET

    document.getElementById(
        "goalSheet"
    ).innerHTML = `

        <table>

            <thead>

                <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Saved</th>
                    <th>Progress</th>
                </tr>

            </thead>

            <tbody>

                ${goals.map(goal => {

                    const percentage =
                        Math.min(
                            goal.saved /
                            goal.target *
                            100,
                            100
                        );


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    goal.name
                                )}
                            </td>

                            <td>
                                ${currency(
                                    goal.target
                                )}
                            </td>

                            <td>
                                ${currency(
                                    goal.saved
                                )}
                            </td>

                            <td>
                                ${percentage.toFixed(0)}%
                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

    `;

}


function createSheet(data) {

    if (data.length === 0) {

        return `
            <div class="empty">
                No records available.
            </div>
        `;

    }


    return `

        <table>

            <thead>

                <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                </tr>

            </thead>

            <tbody>

                ${data.map(transaction => `

                    <tr>

                        <td>
                            ${escapeHTML(
                                transaction.description
                            )}
                        </td>

                        <td>
                            ${transaction.category}
                        </td>

                        <td>
                            ${transaction.date || "-"}
                        </td>

                        <td>
                            ${currency(
                                transaction.amount
                            )}
                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;

}


// ================= HELPERS =================

function getCategoryIcon(category) {

    const icons = {

        Food: "🍔",

        Shopping: "🛍️",

        Transport: "🚗",

        Bills: "💡",

        Entertainment: "🎮",

        Health: "❤️",

        Education: "📚",

        Other: "📦"

    };


    return icons[category] || "📦";

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ================= SAVE DATA =================

function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );


    localStorage.setItem(
        "budgets",
        JSON.stringify(budgets)
    );


    localStorage.setItem(
        "goals",
        JSON.stringify(goals)
    );

}


// ================= DARK MODE =================

const themeBtn =
    document.getElementById("themeBtn");


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "darkMode",
            dark
        );


        themeBtn.innerHTML =
            dark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

    }
);


if (
    localStorage.getItem("darkMode")
    === "true"
) {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        "☀️ Light Mode";

}


// ================= UPDATE EVERYTHING =================

function updateAll() {

    updateDashboard();

    renderTransactions();

    renderBudgets();

    renderReports();

    renderGoals();

    renderSheets();

}


// ================= START =================

document
    .getElementById("transactionDate")
    .valueAsDate = new Date();


updateAll();
