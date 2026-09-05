// ========================================
// Expense Tracker Frontend
// ========================================


// ========================================
// API
// ========================================

const API_URL =
    "http://127.0.0.1:8000";


// ========================================
// DOM Elements
// ========================================


// Financial overview

const balanceElement =
    document.getElementById(
        "balance"
    );

const incomeElement =
    document.getElementById(
        "income"
    );

const expensesElement =
    document.getElementById(
        "expenses"
    );

const transactionCountValueElement =
    document.getElementById(
        "transaction-count-value"
    );


// Transaction form

const transactionForm =
    document.getElementById(
        "transaction-form"
    );

const amountInput =
    document.getElementById(
        "amount"
    );

const dateInput =
    document.getElementById(
        "date"
    );

const categoryInput =
    document.getElementById(
        "category"
    );

const typeInput =
    document.getElementById(
        "type"
    );

const descriptionInput =
    document.getElementById(
        "description"
    );


// Form controls

const formTitle =
    document.getElementById(
        "form-title"
    );

const formDescription =
    document.getElementById(
        "form-description"
    );

const submitButton =
    document.getElementById(
        "submit-button"
    );

const cancelEditButton =
    document.getElementById(
        "cancel-edit-button"
    );


// Transactions

const transactionsList =
    document.getElementById(
        "transactions-list"
    );

const transactionCount =
    document.getElementById(
        "transaction-count"
    );


// Search / filters

const searchInput =
    document.getElementById(
        "search-input"
    );

const typeFilter =
    document.getElementById(
        "type-filter"
    );

const categoryFilter =
    document.getElementById(
        "category-filter"
    );

const startDateInput =
    document.getElementById(
        "start-date"
    );

const endDateInput =
    document.getElementById(
        "end-date"
    );

const sortFilter =
    document.getElementById(
        "sort-filter"
    );

const clearFiltersButton =
    document.getElementById(
        "clear-filters"
    );


// Analytics

const categoryList =
    document.getElementById(
        "category-list"
    );


// ========================================
// Application State
// ========================================

let allTransactions = [];

let editingTransactionId = null;


// ========================================
// Load Transactions
// ========================================

async function loadTransactions() {

    try {

        transactionsList.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading"
                >
                    Loading transactions...
                </td>
            </tr>
        `;


        const response =
            await fetch(
                `${API_URL}/transactions`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load transactions."
            );

        }


        const transactions =
            await response.json();


        allTransactions =
            transactions;


        // Update dashboard
        updateFinancialOverview(
            allTransactions
        );


        // Update category filter
        populateCategoryFilter(
            allTransactions
        );


        // Apply current filters
        applyFilters();


    } catch (error) {

        console.error(
            "Error loading transactions:",
            error
        );


        transactionsList.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="error-message"
                >
                    Failed to load transactions.
                </td>
            </tr>
        `;

    }

}


// ========================================
// Load Summary
// ========================================

async function loadSummary() {

    try {

        const response =
            await fetch(
                `${API_URL}/summary`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load summary."
            );

        }


        const summary =
            await response.json();


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


        transactionCountValueElement.textContent =
            summary.transaction_count;


    } catch (error) {

        console.error(
            "Error loading summary:",
            error
        );

    }

}


// ========================================
// Load Category Analytics
// ========================================

async function loadCategoryAnalytics() {

    try {

        categoryList.innerHTML = `
            <p class="loading">
                Loading analytics...
            </p>
        `;

        const response = await fetch(
            `${API_URL}/analytics/categories`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load category analytics."
            );
        }

        const categories = await response.json();

        categoryList.innerHTML = "";

        const entries = Object.entries(categories);

        if (entries.length === 0) {

            categoryList.innerHTML = `
                <p class="empty-message">
                    No expense data available.
                </p>
            `;

            return;
        }

        entries.sort(
            (a, b) =>
                Number(b[1]) - Number(a[1])
        );

        for (
            const [category, amount]
            of entries
        ) {

            const chip =
                document.createElement("div");

            chip.className =
                "category-chip";

            chip.textContent =
                `${category}: ${formatCurrency(amount)}`;

            categoryList.appendChild(chip);
        }

    } catch (error) {

        console.error(
            "Error loading category analytics:",
            error
        );

        categoryList.innerHTML = `
            <p class="error-message">
                Failed to load analytics.
            </p>
        `;
    }
}


// ========================================
// Update Financial Overview
// ========================================

function updateFinancialOverview(
    transactions
) {

    let income = 0;
    let expenses = 0;

    for (
        const transaction
        of transactions
    ) {

        if (
            transaction.type === "income"
        ) {

            income += Number(
                transaction.amount
            );

        }

        if (
            transaction.type === "expense"
        ) {

            expenses += Number(
                transaction.amount
            );

        }

    }

    const balance =
        income - expenses;

    balanceElement.textContent =
        formatCurrency(balance);

    incomeElement.textContent =
        formatCurrency(income);

    expensesElement.textContent =
        formatCurrency(expenses);

    transactionCountValueElement.textContent =
        transactions.length;
}


// ========================================
// Populate Category Filter
// ========================================

function populateCategoryFilter(
    transactions
) {

    const selectedCategory =
        categoryFilter.value;


    const categories =
        new Set();


    for (
        const transaction
        of transactions
    ) {

        if (
            transaction.category
        ) {

            categories.add(
                transaction.category
            );

        }

    }


    const sortedCategories =
        [...categories].sort(
            (a, b) =>
                a.localeCompare(b)
        );


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    for (
        const category
        of sortedCategories
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
        sortedCategories.includes(
            selectedCategory
        )
    ) {

        categoryFilter.value =
            selectedCategory;

    }

}


// ========================================
// Apply Search / Filters / Sorting
// ========================================

function applyFilters() {

    let filteredTransactions =
        [...allTransactions];


    // ====================================
    // Search
    // ====================================

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchText) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const category =
                        String(
                            transaction.category ||
                            ""
                        ).toLowerCase();


                    const description =
                        String(
                            transaction.description ||
                            ""
                        ).toLowerCase();


                    const type =
                        String(
                            transaction.type ||
                            ""
                        ).toLowerCase();


                    const id =
                        String(
                            transaction.id
                        );


                    return (
                        category.includes(
                            searchText
                        ) ||

                        description.includes(
                            searchText
                        ) ||

                        type.includes(
                            searchText
                        ) ||

                        id.includes(
                            searchText
                        )
                    );

                }
            );

    }


    // ====================================
    // Type Filter
    // ====================================

    const selectedType =
        typeFilter.value;


    if (
        selectedType !== "all"
    ) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction =>
                    transaction.type ===
                    selectedType
            );

    }


    // ====================================
    // Category Filter
    // ====================================

    const selectedCategory =
        categoryFilter.value;


    if (
        selectedCategory !== "all"
    ) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction =>
                    transaction.category ===
                    selectedCategory
            );

    }


    // ====================================
    // Start Date
    // ====================================

    const startDate =
        startDateInput.value;


    if (startDate) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const transactionDate =
                        convertToInputDate(
                            transaction.date
                        );


                    return (
                        transactionDate >=
                        startDate
                    );

                }
            );

    }


    // ====================================
    // End Date
    // ====================================

    const endDate =
        endDateInput.value;


    if (endDate) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const transactionDate =
                        convertToInputDate(
                            transaction.date
                        );


                    return (
                        transactionDate <=
                        endDate
                    );

                }
            );

    }


    // ====================================
    // Sorting
    // ====================================

    sortTransactions(
        filteredTransactions
    );


    // ====================================
    // Display
    // ====================================

    displayTransactions(
        filteredTransactions
    );


    // ====================================
    // Count
    // ====================================

    transactionCount.textContent =
        `Showing ${
            filteredTransactions.length
        } of ${
            allTransactions.length
        } transactions`;

}


// ========================================
// Sort Transactions
// ========================================

function sortTransactions(
    transactions
) {

    const sortType =
        sortFilter.value;


    transactions.sort(
        (a, b) => {

            const dateA =
                convertToInputDate(
                    a.date
                );


            const dateB =
                convertToInputDate(
                    b.date
                );


            if (
                sortType ===
                "newest"
            ) {

                return (
                    dateB.localeCompare(
                        dateA
                    )
                );

            }


            if (
                sortType ===
                "oldest"
            ) {

                return (
                    dateA.localeCompare(
                        dateB
                    )
                );

            }


            if (
                sortType ===
                "highest"
            ) {

                return (
                    Number(b.amount) -
                    Number(a.amount)
                );

            }


            if (
                sortType ===
                "lowest"
            ) {

                return (
                    Number(a.amount) -
                    Number(b.amount)
                );

            }


            return 0;

        }
    );

}


// ========================================
// Display Transactions
// ========================================

function displayTransactions(
    transactions
) {

    transactionsList.innerHTML = "";


    if (
        transactions.length === 0
    ) {

        transactionsList.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-message"
                >
                    No transactions found.
                </td>
            </tr>
        `;

        return;

    }


    for (
        const transaction
        of transactions
    ) {

        const row =
            document.createElement(
                "tr"
            );


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
            transaction.date;


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


        typeBadge.className =
            `transaction-type ${
                transaction.type
            }`;


        typeBadge.textContent =
            capitalize(
                transaction.type
            );


        typeCell.appendChild(
            typeBadge
        );


        // Amount

        const amountCell =
            document.createElement(
                "td"
            );


        amountCell.className =
            `amount ${
                transaction.type
            }`;


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


        const actionButtons =
            document.createElement(
                "div"
            );


        actionButtons.className =
            "action-buttons";


        // Edit button

        const editButton =
            document.createElement(
                "button"
            );


        editButton.className =
            "edit-button";


        editButton.dataset.id =
            transaction.id;


        editButton.textContent =
            "Edit";


        // Delete button

        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.className =
            "delete-button";


        deleteButton.dataset.id =
            transaction.id;


        deleteButton.textContent =
            "Delete";


        actionButtons.appendChild(
            editButton
        );


        actionButtons.appendChild(
            deleteButton
        );


        actionCell.appendChild(
            actionButtons
        );


        // Build row

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


// ========================================
// Add / Update Transaction
// ========================================

transactionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const transaction = {

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

            let response;


            // =================================
            // ADD
            // =================================

            if (
                editingTransactionId ===
                null
            ) {

                response =
                    await fetch(
                        `${API_URL}/transactions`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    transaction
                                )

                        }
                    );

            }


            // =================================
            // UPDATE
            // =================================

            else {

                response =
                    await fetch(
                        `${API_URL}/transactions/${
                            editingTransactionId
                        }`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    transaction
                                )

                        }
                    );

            }


            if (!response.ok) {

                const errorData =
                    await response.json();


                throw new Error(
                    errorData.detail ||
                    "Failed to save transaction."
                );

            }


            const savedTransaction =
                await response.json();


            console.log(
                "Transaction saved:",
                savedTransaction
            );


            resetForm();


            await refreshDashboard();


        } catch (error) {

            console.error(
                "Error saving transaction:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// ========================================
// Table Actions
// ========================================

transactionsList.addEventListener(
    "click",
    async function (event) {


        // =================================
        // EDIT
        // =================================

        if (
            event.target.classList.contains(
                "edit-button"
            )
        ) {

            const transactionId =
                Number(
                    event.target.dataset.id
                );


            await startEditTransaction(
                transactionId
            );


            return;

        }


        // =================================
        // DELETE
        // =================================

        if (
            event.target.classList.contains(
                "delete-button"
            )
        ) {

            const transactionId =
                Number(
                    event.target.dataset.id
                );


            const confirmed =
                confirm(
                    `Are you sure you want to delete transaction ${transactionId}?`
                );


            if (!confirmed) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/transactions/${
                            transactionId
                        }`,
                        {
                            method: "DELETE"
                        }
                    );


                if (!response.ok) {

                    const errorData =
                        await response.json();


                    throw new Error(
                        errorData.detail ||
                        "Failed to delete transaction."
                    );

                }


                const deletedTransaction =
                    await response.json();


                console.log(
                    "Transaction deleted:",
                    deletedTransaction
                );


                await refreshDashboard();


            } catch (error) {

                console.error(
                    "Error deleting transaction:",
                    error
                );


                alert(
                    error.message
                );

            }

        }

    }
);


// ========================================
// Start Edit
// ========================================

async function startEditTransaction(
    transactionId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/transactions/${
                    transactionId
                }`
            );


        if (!response.ok) {

            const errorData =
                await response.json();


            throw new Error(
                errorData.detail ||
                "Failed to load transaction."
            );

        }


        const transaction =
            await response.json();


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


        editingTransactionId =
            transactionId;


        formTitle.textContent =
            "Edit Transaction";


        formDescription.textContent =
            "Update the transaction details.";


        submitButton.textContent =
            "Update Transaction";


        cancelEditButton.hidden =
            false;


        transactionForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


    } catch (error) {

        console.error(
            "Error loading transaction:",
            error
        );


        alert(
            error.message
        );

    }

}


// ========================================
// Cancel Edit
// ========================================

cancelEditButton.addEventListener(
    "click",
    function () {

        resetForm();

    }
);


// ========================================
// Reset Form
// ========================================

function resetForm() {

    transactionForm.reset();


    editingTransactionId =
        null;


    formTitle.textContent =
        "Add Transaction";


    formDescription.textContent =
        "Record a new income or expense.";


    submitButton.textContent =
        "+ Add Transaction";


    cancelEditButton.hidden =
        true;

}


// ========================================
// Clear Filters
// ========================================

clearFiltersButton.addEventListener(
    "click",
    function () {

        searchInput.value =
            "";

        typeFilter.value =
            "all";

        categoryFilter.value =
            "all";

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
// Search / Filter Events
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
// Refresh Entire Dashboard
// ========================================

async function refreshDashboard() {

    await loadTransactions();

    await loadSummary();

    await loadCategoryAnalytics();

}


// ========================================
// Convert Date
// ========================================

function convertToInputDate(
    dateString
) {

    if (
        !dateString
    ) {

        return "";

    }


    // Already YYYY-MM-DD

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateString
        )
    ) {

        return dateString;

    }


    // Convert DD/MM/YYYY

    const parts =
        dateString.split("/");


    if (
        parts.length === 3
    ) {

        const day =
            parts[0].padStart(
                2,
                "0"
            );


        const month =
            parts[1].padStart(
                2,
                "0"
            );


        const year =
            parts[2];


        return `${year}-${month}-${day}`;

    }


    return "";

}


// ========================================
// Currency Formatting
// ========================================

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }
    ).format(
        Number(amount)
    );

}


// ========================================
// Capitalize
// ========================================

function capitalize(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ========================================
// Start Application
// ========================================


refreshDashboard();