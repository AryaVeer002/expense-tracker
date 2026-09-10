// ========================================
// Expense Tracker Frontend
// ========================================


// ========================================
// API Configuration
// ========================================

const API_URL = "http://127.0.0.1:8000";


// ========================================
// Application State
// ========================================

let allTransactions = [];

let editingTransactionId = null;

let originalEditData = null;


// ========================================
// Chart Instances
// ========================================

let categoryChartInstance = null;

let incomeExpenseChartInstance = null;

let monthlyExpenseChartInstance = null;


// ========================================
// DOM Elements
// ========================================

const transactionForm =
    document.getElementById("transaction-form");

const formTitle =
    document.getElementById("form-title");

const formDescription =
    document.getElementById("form-description");

const submitButton =
    document.getElementById("submit-button");

const cancelEditButton =
    document.getElementById("cancel-edit-button");

const amountInput =
    document.getElementById("amount");

const dateInput =
    document.getElementById("date");

const categoryInput =
    document.getElementById("category");

const typeInput =
    document.getElementById("type");

const descriptionInput =
    document.getElementById("description");

const searchInput =
    document.getElementById("search-input");

const typeFilter =
    document.getElementById("type-filter");

const categoryFilter =
    document.getElementById("category-filter");

const startDateInput =
    document.getElementById("start-date");

const endDateInput =
    document.getElementById("end-date");

const sortFilter =
    document.getElementById("sort-filter");

const clearFiltersButton =
    document.getElementById("clear-filters");

const transactionsList =
    document.getElementById("transactions-list");

const transactionCount =
    document.getElementById("transaction-count");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expensesElement =
    document.getElementById("expenses");

const transactionCountValue =
    document.getElementById("transaction-count-value");

const categoryChartEmptyMessage =
    document.getElementById(
        "category-chart-empty-message"
    );

const incomeExpenseChartEmptyMessage =
    document.getElementById(
        "income-expense-chart-empty-message"
    );

const monthlyExpenseChartEmptyMessage =
    document.getElementById(
        "monthly-expense-chart-empty-message"
    );

const summaryDescription =
    document.getElementById("summary-description");



// ========================================
// Toast Notifications
// ========================================

function showToast(
    message,
    type = "info",
    duration = 3000
) {

    const toastContainer =
        document.getElementById(
            "toast-container"
        );

    if (!toastContainer) {
        return;
    }


    const toast =
        document.createElement("div");


    toast.className =
        `toast toast-${type}`;


    toast.textContent =
        message;


    toastContainer.appendChild(
        toast
    );


    setTimeout(() => {

        toast.remove();

    }, duration);
}


// ========================================
// Chart Empty State Helper
// ========================================

function setChartEmptyState(
    canvasId,
    emptyStateId,
    isEmpty
) {

    const canvas =
        document.getElementById(
            canvasId
        );

    const emptyState =
        document.getElementById(
            emptyStateId
        );


    if (!canvas || !emptyState) {
        return;
    }


    canvas.style.visibility =
        isEmpty
            ? "hidden"
            : "visible";


    emptyState.hidden =
        !isEmpty;
}


// ========================================
// Currency Formatting
// ========================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(
        Number(amount) || 0
    );
}


// ========================================
// Date Helpers
// ========================================

function parseTransactionDate(
    dateString
) {

    if (!dateString) {
        return null;
    }


    // YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(dateString)
    ) {

        const [
            year,
            month,
            day
        ] =
            dateString
                .split("-")
                .map(Number);


        return new Date(
            year,
            month - 1,
            day
        );
    }


    // DD/MM/YYYY
    if (
        /^\d{2}\/\d{2}\/\d{4}$/
            .test(dateString)
    ) {

        const [
            day,
            month,
            year
        ] =
            dateString
                .split("/")
                .map(Number);


        return new Date(
            year,
            month - 1,
            day
        );
    }


    const parsed =
        new Date(dateString);


    if (isNaN(parsed)) {
        return null;
    }


    return parsed;
}


function convertToInputDate(
    dateString
) {

    const date =
        parseTransactionDate(
            dateString
        );


    if (!date) {
        return "";
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function formatDisplayDate(
    dateString
) {

    const date =
        parseTransactionDate(
            dateString
        );


    if (!date) {
        return dateString || "";
    }


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;
}


// ========================================
// API Helper
// ========================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            options
        );


    if (!response.ok) {

        let errorMessage =
            `Request failed (${response.status})`;


        try {

            const errorData =
                await response.json();


            if (errorData.detail) {

                errorMessage =
                    errorData.detail;
            }

        } catch (error) {

            // Ignore JSON parsing error
        }


        throw new Error(
            errorMessage
        );
    }


    return response.json();
}


// ========================================
// Load Transactions
// ========================================

async function loadTransactions() {

    // Loading state
    transactionsList.innerHTML = `
        <tr>
            <td colspan="7">

                <div class="loading-state">

                    <div class="loading-icon">
                        ⏳
                    </div>

                    <p>
                        Loading transactions...
                    </p>

                </div>

            </td>
        </tr>
    `;


    try {

        const transactions =
            await apiRequest(
                "/transactions"
            );


        allTransactions =
            transactions;


        updateCategoryFilter();


        applyFilters();

    } catch (error) {

        console.error(
            "Error loading transactions:",
            error
        );


        transactionsList.innerHTML = `
            <tr>
                <td colspan="7">

                    <div class="error-state">

                        <div class="error-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to load transactions
                        </h3>

                        <p>
                            We couldn't connect to the server.
                        </p>

                        <button
                            type="button"
                            id="retry-transactions"
                            class="retry-button"
                        >
                            Try Again
                        </button>

                    </div>

                </td>
            </tr>
        `;


        const retryButton =
            document.getElementById(
                "retry-transactions"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadTransactions
            );
        }
    }
}


// ========================================
// Load Summary
// ========================================

async function loadSummary() {

    try {

        const summary =
            await apiRequest(
                "/summary"
            );


        balanceElement.textContent =
            formatCurrency(
                summary.balance
            );


        incomeElement.textContent =
            formatCurrency(
                summary.income
            );


        expensesElement.textContent =
            formatCurrency(
                summary.expenses
            );


        transactionCountValue.textContent =
            summary.transaction_count;

    } catch (error) {

        console.error(
            "Error loading summary:",
            error
        );
    }
}


// ========================================
// Refresh Dashboard
// ========================================

async function refreshDashboard() {

    await loadTransactions();

    await loadSummary();
}


// ========================================
// Update Category Filter
// ========================================

function updateCategoryFilter() {

    const currentValue =
        categoryFilter.value;


    const categories =
        [
            ...new Set(
                allTransactions
                    .map(
                        transaction =>
                            transaction.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    categoryFilter.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;


    for (
        const category
        of categories
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category;


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );
    }


    if (
        categories.includes(
            currentValue
        )
    ) {

        categoryFilter.value =
            currentValue;
    }
}


// ========================================
// Display Transactions
// ========================================

function displayTransactions(
    transactions
) {

    transactionsList.innerHTML =
        "";


    // Empty state
    if (
        transactions.length === 0
    ) {

        transactionsList.innerHTML = `
            <tr>
                <td colspan="7">

                    <div class="empty-state">

                        <div class="empty-state-icon">
                            📭
                        </div>

                        <h3>
                            No transactions found
                        </h3>

                        <p>
                            Add your first transaction to get started.
                        </p>

                    </div>

                </td>
            </tr>
        `;


        transactionCount.textContent =
            "Showing 0 transactions";


        return;
    }


    transactionCount.textContent =
        `Showing ${transactions.length} of ${allTransactions.length} transactions`;


    for (
        const transaction
        of transactions
    ) {

        const row =
            document.createElement(
                "tr"
            );

        if (
            editingTransactionId !== null &&
            Number(transaction.id) === Number(editingTransactionId)
        ) {
            row.classList.add("editing-row");
        }

        // ID
        const idCell =
            document.createElement(
                "td"
            );

        idCell.textContent =
            transaction.id;


        // Date
        const dateCell =
            document.createElement(
                "td"
            );

        dateCell.textContent =
            formatDisplayDate(
                transaction.date
            );


        // Category
        const categoryCell =
            document.createElement(
                "td"
            );

        categoryCell.textContent =
            transaction.category;


        // Type
        const typeCell =
            document.createElement(
                "td"
            );


        const typeBadge =
            document.createElement(
                "span"
            );


        typeBadge.textContent =
            transaction.type;


        typeBadge.className =
            `type-badge ${transaction.type}`;


        typeCell.appendChild(
            typeBadge
        );


        // Amount
        const amountCell =
            document.createElement(
                "td"
            );


        amountCell.textContent =
            formatCurrency(
                transaction.amount
            );


        // Description
        const descriptionCell =
            document.createElement(
                "td"
            );


        descriptionCell.textContent =
            transaction.description ||
            "-";


        // Actions
        const actionCell =
            document.createElement(
                "td"
            );


        const editButton =
            document.createElement(
                "button"
            );


        editButton.textContent =
            "Edit";


        editButton.className =
            "edit-button";


        editButton.dataset.id =
            transaction.id;


        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.textContent =
            "Delete";


        deleteButton.className =
            "delete-button";


        deleteButton.dataset.id =
            transaction.id;


        actionCell.appendChild(
            editButton
        );


        actionCell.appendChild(
            deleteButton
        );


        row.appendChild(
            idCell
        );


        row.appendChild(
            dateCell
        );


        row.appendChild(
            categoryCell
        );


        row.appendChild(
            typeCell
        );


        row.appendChild(
            amountCell
        );


        row.appendChild(
            descriptionCell
        );


        row.appendChild(
            actionCell
        );


        transactionsList.appendChild(
            row
        );
    }
}

function updateFilteredSummary(transactions) {
    let income = 0;
    let expenses = 0;

    for (const transaction of transactions) {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
            income += amount;
        } else if (transaction.type === "expense") {
            expenses += amount;
        }
    }

    const balance = income - expenses;

    balanceElement.textContent =
        formatCurrency(balance);

    incomeElement.textContent =
        formatCurrency(income);

    expensesElement.textContent =
        formatCurrency(expenses);

    transactionCountValue.textContent =
        transactions.length;
}

function updateSummaryDescription() {
    const hasActiveFilters =
        searchInput.value.trim() !== "" ||
        typeFilter.value !== "" ||
        categoryFilter.value !== "" ||
        startDateInput.value !== "" ||
        endDateInput.value !== "";

    if (hasActiveFilters) {
        summaryDescription.textContent =
            "Showing filtered results";
    } else {
        summaryDescription.textContent =
            "Your current financial summary";
    }
}

// ========================================
// Apply Filters
// ========================================

function applyFilters() {

    updateSummaryDescription();

    // Start with all transactions
    let filteredTransactions = [...allTransactions];


    // ========================================
    // Search Filter
    // ========================================

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    if (searchTerm !== "") {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const category =
                        String(
                            transaction.category || ""
                        ).toLowerCase();

                    const description =
                        String(
                            transaction.description || ""
                        ).toLowerCase();

                    return (
                        category.includes(searchTerm) ||
                        description.includes(searchTerm)
                    );
                }
            );
    }


    // ========================================
    // Type Filter
    // ========================================

    const selectedType =
        typeFilter.value;

    if (
        selectedType !== "" &&
        selectedType !== "all"
    ) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction =>
                    transaction.type === selectedType
            );
    }


    // ========================================
    // Category Filter
    // ========================================

    const selectedCategory =
        categoryFilter.value;

    if (
        selectedCategory !== "" &&
        selectedCategory !== "all"
    ) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction =>
                    transaction.category ===
                    selectedCategory
            );
    }


    // ========================================
    // Start Date Filter
    // ========================================

    const startDateValue =
        startDateInput.value;

    if (startDateValue !== "") {

        const startDate =
            parseTransactionDate(
                startDateValue
            );

        if (startDate) {

            startDate.setHours(
                0,
                0,
                0,
                0
            );

            filteredTransactions =
                filteredTransactions.filter(
                    transaction => {

                        const transactionDate =
                            parseTransactionDate(
                                transaction.date
                            );

                        if (!transactionDate) {
                            return false;
                        }

                        transactionDate.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        return (
                            transactionDate >=
                            startDate
                        );
                    }
                );
        }
    }


    // ========================================
    // End Date Filter
    // ========================================

    const endDateValue =
        endDateInput.value;

    if (endDateValue !== "") {

        const endDate =
            parseTransactionDate(
                endDateValue
            );

        if (endDate) {

            endDate.setHours(
                23,
                59,
                59,
                999
            );

            filteredTransactions =
                filteredTransactions.filter(
                    transaction => {

                        const transactionDate =
                            parseTransactionDate(
                                transaction.date
                            );

                        if (!transactionDate) {
                            return false;
                        }

                        transactionDate.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        return (
                            transactionDate <=
                            endDate
                        );
                    }
                );
        }
    }


    // ========================================
    // Sorting
    // ========================================

    const sortValue =
        sortFilter.value;


    if (sortValue === "newest") {

        filteredTransactions.sort(
            (a, b) => {

                const dateA =
                    parseTransactionDate(
                        a.date
                    );

                const dateB =
                    parseTransactionDate(
                        b.date
                    );

                if (!dateA || !dateB) {
                    return 0;
                }

                return dateB - dateA;
            }
        );
    }


    else if (sortValue === "oldest") {

        filteredTransactions.sort(
            (a, b) => {

                const dateA =
                    parseTransactionDate(
                        a.date
                    );

                const dateB =
                    parseTransactionDate(
                        b.date
                    );

                if (!dateA || !dateB) {
                    return 0;
                }

                return dateA - dateB;
            }
        );
    }


    else if (sortValue === "highest") {

        filteredTransactions.sort(
            (a, b) =>
                Number(b.amount) -
                Number(a.amount)
        );
    }


    else if (sortValue === "lowest") {

        filteredTransactions.sort(
            (a, b) =>
                Number(a.amount) -
                Number(b.amount)
        );
    }


    // ========================================
    // Update UI
    // ========================================

    displayTransactions(
        filteredTransactions
    );

    updateFilteredSummary(
        filteredTransactions
    );

    updateCategoryChart(
        filteredTransactions
    );

    updateIncomeExpenseChart(
        filteredTransactions
    );


    updateMonthlyExpenseChart(
        filteredTransactions
    );
}


// ========================================
// Update Category Chart
// ========================================

function updateCategoryChart(
    transactions
) {

    const categoryExpenses = {};


    for (
        const transaction
        of transactions
    ) {

        if (
            transaction.type !==
            "expense"
        ) {
            continue;
        }


        const category =
            transaction.category ||
            "Other";


        if (
            !categoryExpenses[category]
        ) {

            categoryExpenses[category] =
                0;
        }


        categoryExpenses[category] +=
            Number(
                transaction.amount
            );
    }


    const entries =
        Object.entries(
            categoryExpenses
        );


    // Destroy previous chart
    if (
        categoryChartInstance
    ) {

        categoryChartInstance.destroy();

        categoryChartInstance =
            null;
    }


    // Empty state
    if (
        entries.length === 0
    ) {

        const hasActiveFilters =
            searchInput.value.trim() !== "" ||
            typeFilter.value !== "" ||
            categoryFilter.value !== "" ||
            startDateInput.value !== "" ||
            endDateInput.value !== "";

        if (hasActiveFilters) {
            categoryChartEmptyMessage.textContent =
                "No matching expense data";
        } else {
            categoryChartEmptyMessage.textContent =
                "No expense data available";
        }

        setChartEmptyState(
            "category-chart",
            "category-chart-empty",
            true
        );

        return;
    }


    // Show chart
    setChartEmptyState(
        "category-chart",
        "category-chart-empty",
        false
    );


    entries.sort(
        (a, b) =>
            Number(b[1]) -
            Number(a[1])
    );


    const labels =
        entries.map(
            entry => entry[0]
        );


    const values =
        entries.map(
            entry =>
                Number(entry[1])
        );


    const canvas =
        document.getElementById(
            "category-chart"
        );


    categoryChartInstance =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label: "Expenses",

                            data: values
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            position: "bottom"
                        },

                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${formatCurrency(context.parsed)}`;
                                }
                            }
                        }
                    }
                }
            }
        );
}


// ========================================
// Update Income vs Expenses Chart
// ========================================

function updateIncomeExpenseChart(
    transactions
) {

    // Empty state
    if (
        transactions.length === 0
    ) {

        if (
            incomeExpenseChartInstance
        ) {

            incomeExpenseChartInstance.destroy();

            incomeExpenseChartInstance =
                null;
        }


        setChartEmptyState(
            "income-expense-chart",
            "income-expense-chart-empty",
            true
        );


        return;
    }


    // Show chart
    setChartEmptyState(
        "income-expense-chart",
        "income-expense-chart-empty",
        false
    );


    let income = 0;

    let expenses = 0;


    for (
        const transaction
        of transactions
    ) {

        const amount =
            Number(
                transaction.amount
            );


        if (
            transaction.type ===
            "income"
        ) {

            income += amount;
        }


        else if (
            transaction.type ===
            "expense"
        ) {

            expenses += amount;
        }
    }


    const canvas =
        document.getElementById(
            "income-expense-chart"
        );


    if (
        incomeExpenseChartInstance
    ) {

        incomeExpenseChartInstance.destroy();
    }


    incomeExpenseChartInstance =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Income",
                        "Expenses"
                    ],

                    datasets: [
                        {
                            label: "Amount",

                            data: [
                                income,
                                expenses
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ========================================
// Update Monthly Expenses Chart
// ========================================

function updateMonthlyExpenseChart(
    transactions
) {

    const expenseTransactions =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    // Empty state
    if (
        expenseTransactions.length ===
        0
    ) {

        if (
            monthlyExpenseChartInstance
        ) {

            monthlyExpenseChartInstance.destroy();

            monthlyExpenseChartInstance =
                null;
        }


        const hasActiveFilters =
            searchInput.value.trim() !== "" ||
            typeFilter.value !== "" ||
            categoryFilter.value !== "" ||
            startDateInput.value !== "" ||
            endDateInput.value !== "";


        if (hasActiveFilters) {

            monthlyExpenseChartEmptyMessage.textContent =
                "No matching expense data";

        } else {

            monthlyExpenseChartEmptyMessage.textContent =
                "No monthly expense data available";
        }


        setChartEmptyState(
            "monthly-expense-chart",
            "monthly-expense-chart-empty",
            true
        );


        return;
    }


    // Show chart
    setChartEmptyState(
        "monthly-expense-chart",
        "monthly-expense-chart-empty",
        false
    );


    const monthlyExpenses = {};


    for (
        const transaction
        of expenseTransactions
    ) {

        const date =
            parseTransactionDate(
                transaction.date
            );


        if (!date) {
            continue;
        }


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const key =
            `${year}-${month}`;


        if (
            !monthlyExpenses[key]
        ) {

            monthlyExpenses[key] =
                0;
        }


        monthlyExpenses[key] +=
            Number(
                transaction.amount
            );
    }


    const sortedKeys =
        Object.keys(
            monthlyExpenses
        ).sort();


    const labels =
        sortedKeys.map(
            key => {

                const [
                    year,
                    month
                ] =
                    key.split("-");


                const date =
                    new Date(
                        Number(year),
                        Number(month) - 1,
                        1
                    );


                return date.toLocaleString(
                    "en-US",
                    {
                        month: "short",
                        year: "numeric"
                    }
                );
            }
        );


    const values =
        sortedKeys.map(
            key =>
                monthlyExpenses[key]
        );


    const canvas =
        document.getElementById(
            "monthly-expense-chart"
        );


    if (
        monthlyExpenseChartInstance
    ) {

        monthlyExpenseChartInstance.destroy();
    }


    monthlyExpenseChartInstance =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label: "Expenses",

                            data: values
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ========================================
// Add Transaction
// ========================================

async function addTransaction() {

    const transactionData = {

        amount:
            Number(
                amountInput.value
            ),

        date:
            dateInput.value,

        category:
            categoryInput.value.trim(),

        type:
            typeInput.value,

        description:
            descriptionInput.value.trim()
    };


    try {

        await apiRequest(
            "/transactions",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        transactionData
                    )
            }
        );


        resetForm();


        await refreshDashboard();


        showToast(
            "Transaction added successfully",
            "success"
        );

    } catch (error) {

        console.error(
            "Error adding transaction:",
            error
        );


        showToast(
            "Failed to add transaction",
            "error"
        );
    }
}


// ========================================
// Start Edit Transaction
// ========================================

function startEditTransaction(
    transactionId
) {

    const transaction =
        allTransactions.find(
            item =>
                Number(item.id) ===
                Number(transactionId)
        );


    if (!transaction) {

        showToast(
            "Transaction not found",
            "error"
        );

        return;
    }


    editingTransactionId =
        Number(transactionId);


    originalEditData = {
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category,
        type: transaction.type,
        description: transaction.description || ""
    };


    amountInput.value =
        transaction.amount;


    dateInput.value =
        convertToInputDate(
            transaction.date
        );


    categoryInput.value =
        transaction.category;


    typeInput.value =
        transaction.type;


    descriptionInput.value =
        transaction.description ||
        "";


    formTitle.textContent =
        `✏️ Editing Transaction #${transaction.id}`;


    submitButton.textContent =
        "Update Transaction";


    cancelEditButton.style.display =
        "inline-block";

    applyFilters();

    transactionForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// ========================================
// Update Transaction
// ========================================

async function updateTransaction() {

    const transactionData = {

        amount:
            Number(
                amountInput.value
            ),

        date:
            dateInput.value,

        category:
            categoryInput.value.trim(),

        type:
            typeInput.value,

        description:
            descriptionInput.value.trim()
    };


    try {

        await apiRequest(
            `/transactions/${editingTransactionId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        transactionData
                    )
            }
        );


        resetForm();


        await refreshDashboard();


        showToast(
            "Transaction updated successfully",
            "success"
        );

    } catch (error) {

        console.error(
            "Error updating transaction:",
            error
        );


        showToast(
            "Failed to update transaction",
            "error"
        );
    }
}


// ========================================
// Delete Transaction
// ========================================

async function deleteTransaction(
    transactionId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this transaction?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `/transactions/${transactionId}`,
            {
                method: "DELETE"
            }
        );


        if (
            Number(editingTransactionId) ===
            Number(transactionId)
        ) {

            resetForm();
        }


        await refreshDashboard();


        showToast(
            "Transaction deleted successfully",
            "success"
        );

    } catch (error) {

        console.error(
            "Error deleting transaction:",
            error
        );


        showToast(
            "Failed to delete transaction",
            "error"
        );
    }
}


// ========================================
// Reset Form
// ========================================

function resetForm() {

    transactionForm.reset();


    editingTransactionId =
        null;

    originalEditData =
        null;


    formTitle.textContent =
        "Add Transaction";


    formDescription.textContent =
        "Record a new income or expense.";


    submitButton.textContent =
        "Add Transaction";


    cancelEditButton.style.display =
        "none";
}


// ========================================
// Form Submit
// ========================================

transactionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (
            editingTransactionId ===
            null
        ) {

            await addTransaction();

        } else {

            await updateTransaction();
        }
    }
);


// ========================================
// Cancel Edit
// ========================================

cancelEditButton.addEventListener(
    "click",
    function() {

        if (
            editingTransactionId === null
        ) {
            resetForm();
            return;
        }


        const currentEditData = {

            amount:
                Number(
                    amountInput.value
                ),

            date:
                dateInput.value,

            category:
                categoryInput.value.trim(),

            type:
                typeInput.value,

            description:
                descriptionInput.value.trim()
        };


        const originalData = {

            amount:
                Number(
                    originalEditData.amount
                ),

            date:
                convertToInputDate(
                    originalEditData.date
                ),

            category:
                originalEditData.category,

            type:
                originalEditData.type,

            description:
                originalEditData.description
        };


        const hasChanges =
            JSON.stringify(
                currentEditData
            ) !==
            JSON.stringify(
                originalData
            );


        if (hasChanges) {

            const confirmed =
                confirm(
                    "You have unsaved changes. Discard them?"
                );


            if (!confirmed) {
                return;
            }
        }


        resetForm();
    }
);


// ========================================
// Search & Filter Events
// ========================================

searchInput.addEventListener(
    "input",
    applyFilters
);


typeFilter.addEventListener(
    "change",
    applyFilters
);


categoryFilter.addEventListener(
    "change",
    applyFilters
);


startDateInput.addEventListener(
    "change",
    applyFilters
);


endDateInput.addEventListener(
    "change",
    applyFilters
);


sortFilter.addEventListener(
    "change",
    applyFilters
);


// ========================================
// Clear Filters
// ========================================

clearFiltersButton.addEventListener(
    "click",
    function() {

        searchInput.value =
            "";

        typeFilter.value =
            "";

        categoryFilter.value =
            "";

        startDateInput.value =
            "";

        endDateInput.value =
            "";

        sortFilter.value =
            "newest";


        applyFilters();
    }
);


// ========================================
// Transaction Table Actions
// ========================================

transactionsList.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const transactionId =
            button.dataset.id;


        if (
            button.classList.contains(
                "edit-button"
            )
        ) {

            startEditTransaction(
                transactionId
            );
        }


        else if (
            button.classList.contains(
                "delete-button"
            )
        ) {

            deleteTransaction(
                transactionId
            );
        }
    }
);


// ========================================
// Initial Application Load
// ========================================

refreshDashboard();