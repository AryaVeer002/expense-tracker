// ========================================
// Expense Tracker Frontend
// ========================================


const API_URL = "http://127.0.0.1:8000";


// ========================================
// DOM Elements
// ========================================

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expensesElement =
    document.getElementById("expenses");


const transactionForm =
    document.getElementById("transaction-form");

const transactionsList =
    document.getElementById("transactions-list");


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


const formTitle =
    document.getElementById("form-title");

const formDescription =
    document.getElementById("form-description");

const submitButton =
    document.getElementById("submit-button");

const cancelEditButton =
    document.getElementById("cancel-edit-button");


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

const transactionCount =
    document.getElementById("transaction-count");


// ========================================
// Application State
// ========================================

let editingTransactionId = null;

let allTransactions = [];


// ========================================
// Load Transactions
// ========================================

async function loadTransactions() {

    try {

        transactionsList.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
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


        // Store all transactions
        allTransactions =
            transactions;


        // Update dashboard using ALL transactions
        updateFinancialOverview(
            allTransactions
        );


        // Build category filter
        populateCategoryFilter(
            allTransactions
        );


        // Display filtered transactions
        applyFilters();


    } catch (error) {

        console.error(
            "Error loading transactions:",
            error
        );


        transactionsList.innerHTML = `
            <tr>
                <td colspan="7" class="error-message">
                    Failed to load transactions.
                </td>
            </tr>
        `;

    }

}


// ========================================
// Financial Overview
// ========================================

function updateFinancialOverview(
    transactions
) {

    let income = 0;

    let expenses = 0;


    for (const transaction of transactions) {

        if (
            transaction.type === "income"
        ) {

            income += transaction.amount;

        }


        if (
            transaction.type === "expense"
        ) {

            expenses += transaction.amount;

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

}


// ========================================
// Populate Category Filter
// ========================================

function populateCategoryFilter(
    transactions
) {

    const currentCategory =
        categoryFilter.value;


    const categories =
        new Set();


    for (const transaction of transactions) {

        if (transaction.category) {

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
            document.createElement("option");


        option.value =
            category;


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );

    }


    // Preserve selected category
    if (
        sortedCategories.includes(
            currentCategory
        )
    ) {

        categoryFilter.value =
            currentCategory;

    }

}


// ========================================
// Apply Search + Filters + Sorting
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
                        transaction.category
                            ?.toLowerCase() || "";


                    const description =
                        transaction.description
                            ?.toLowerCase() || "";


                    const type =
                        transaction.type
                            ?.toLowerCase() || "";


                    return (
                        category.includes(
                            searchText
                        ) ||
                        description.includes(
                            searchText
                        ) ||
                        type.includes(
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


    if (selectedType !== "all") {

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
    // Date Range
    // ====================================

    const startDate =
        startDateInput.value;


    const endDate =
        endDateInput.value;


    if (startDate) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const date =
                        convertToInputDate(
                            transaction.date
                        );

                    return date >= startDate;

                }
            );

    }


    if (endDate) {

        filteredTransactions =
            filteredTransactions.filter(
                transaction => {

                    const date =
                        convertToInputDate(
                            transaction.date
                        );

                    return date <= endDate;

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


    // Update count
    transactionCount.textContent =
        `Showing ${filteredTransactions.length} of ${allTransactions.length} transactions`;

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

            // Convert dates to ISO
            const dateA =
                convertToInputDate(
                    a.date
                );


            const dateB =
                convertToInputDate(
                    b.date
                );


            if (
                sortType === "newest"
            ) {

                return (
                    dateB.localeCompare(
                        dateA
                    )
                );

            }


            if (
                sortType === "oldest"
            ) {

                return (
                    dateA.localeCompare(
                        dateB
                    )
                );

            }


            if (
                sortType === "highest"
            ) {

                return (
                    b.amount - a.amount
                );

            }


            if (
                sortType === "lowest"
            ) {

                return (
                    a.amount - b.amount
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
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${transaction.id}
            </td>

            <td>
                ${transaction.date}
            </td>

            <td>
                ${escapeHTML(
                    transaction.category
                )}
            </td>

            <td>

                <span
                    class="transaction-type ${transaction.type}"
                >
                    ${capitalize(
                        transaction.type
                    )}
                </span>

            </td>

            <td
                class="amount ${transaction.type}"
            >
                ${formatCurrency(
                    transaction.amount
                )}
            </td>

            <td>
                ${escapeHTML(
                    transaction.description || "-"
                )}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-button"
                        data-id="${transaction.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        data-id="${transaction.id}"
                    >
                        Delete
                    </button>

                </div>

            </td>

        `;


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


            // ====================================
            // ADD
            // ====================================

            if (
                editingTransactionId === null
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


            // ====================================
            // UPDATE
            // ====================================

            else {

                response =
                    await fetch(
                        `${API_URL}/transactions/${editingTransactionId}`,
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


            await loadTransactions();


        } catch (error) {

            console.error(
                "Error saving transaction:",
                error
            );


            alert(error.message);

        }

    }
);


// ========================================
// Table Actions
// ========================================

transactionsList.addEventListener(
    "click",
    async function (event) {


        // ====================================
        // EDIT
        // ====================================

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


        // ====================================
        // DELETE
        // ====================================

        if (
            event.target.classList.contains(
                "delete-button"
            )
        ) {

            const transactionId =
                event.target.dataset.id;


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
                        `${API_URL}/transactions/${transactionId}`,
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


                await loadTransactions();


            } catch (error) {

                console.error(
                    "Error deleting transaction:",
                    error
                );


                alert(error.message);

            }

        }

    }
);


// ========================================
// Start Editing
// ========================================

async function startEditTransaction(
    transactionId
) {

    try {

        const response =
            await fetch(
                `${API_URL}/transactions/${transactionId}`
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
            transaction.description || "";


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


        alert(error.message);

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
// Clear Search / Filters
// ========================================

clearFiltersButton.addEventListener(
    "click",
    function () {

        searchInput.value = "";

        typeFilter.value = "all";

        categoryFilter.value = "all";

        startDateInput.value = "";

        endDateInput.value = "";

        sortFilter.value = "newest";


        applyFilters();

    }
);


// ========================================
// Filter Event Listeners
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
// Convert Date
// ========================================

function convertToInputDate(
    dateString
) {

    // YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateString
        )
    ) {

        return dateString;

    }


    // DD/MM/YYYY
    const parts =
        dateString.split("/");


    if (parts.length === 3) {

        const day =
            parts[0].padStart(2, "0");

        const month =
            parts[1].padStart(2, "0");

        const year =
            parts[2];


        return `${year}-${month}-${day}`;

    }


    return "";

}


// ========================================
// Currency
// ========================================

function formatCurrency(
    amount
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",

            currency: "INR",

            maximumFractionDigits: 2
        }
    ).format(amount);

}


// ========================================
// Capitalize
// ========================================

function capitalize(
    text
) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ========================================
// HTML Escaping
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// ========================================
// Start Application
// ========================================

loadTransactions();