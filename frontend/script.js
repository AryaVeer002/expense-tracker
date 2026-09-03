// ========================================
// Expense Tracker Frontend
// ========================================

const API_URL = "http://127.0.0.1:8000";


// ========================================
// DOM Elements
// ========================================

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");

const transactionForm = document.getElementById("transaction-form");
const transactionsList = document.getElementById("transactions-list");

const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");


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

        const response = await fetch(
            `${API_URL}/transactions`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load transactions."
            );
        }

        const transactions = await response.json();

        updateFinancialOverview(transactions);

        displayTransactions(transactions);

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
// Update Financial Overview
// ========================================

function updateFinancialOverview(transactions) {

    let income = 0;

    let expenses = 0;


    for (const transaction of transactions) {

        if (transaction.type === "income") {

            income += transaction.amount;

        }

        if (transaction.type === "expense") {

            expenses += transaction.amount;

        }

    }


    const balance = income - expenses;


    balanceElement.textContent =
        formatCurrency(balance);

    incomeElement.textContent =
        formatCurrency(income);

    expensesElement.textContent =
        formatCurrency(expenses);
}


// ========================================
// Display Transactions
// ========================================

function displayTransactions(transactions) {

    transactionsList.innerHTML = "";


    if (transactions.length === 0) {

        transactionsList.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    No transactions found.
                </td>
            </tr>
        `;

        return;
    }


    for (const transaction of transactions) {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${transaction.id}
            </td>

            <td>
                ${transaction.date}
            </td>

            <td>
                ${escapeHTML(transaction.category)}
            </td>

            <td>

                <span
                    class="transaction-type ${transaction.type}"
                >
                    ${capitalize(transaction.type)}
                </span>

            </td>

            <td class="amount ${transaction.type}">
                ${formatCurrency(transaction.amount)}
            </td>

            <td>
                ${escapeHTML(
                    transaction.description || "-"
                )}
            </td>

            <td>

                <button
                    class="delete-button"
                    data-id="${transaction.id}"
                >
                    Delete
                </button>

            </td>

        `;


        transactionsList.appendChild(row);
    }
}


// ========================================
// Add Transaction
// ========================================

transactionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const transaction = {

            amount: Number(
                amountInput.value
            ),

            date: dateInput.value,

            category: categoryInput.value.trim(),

            type: typeInput.value,

            description:
                descriptionInput.value.trim()
        };


        try {

            const response = await fetch(
                `${API_URL}/transactions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        transaction
                    )
                }
            );


            if (!response.ok) {

                const errorData =
                    await response.json();

                throw new Error(
                    errorData.detail ||
                    "Failed to add transaction."
                );
            }


            const newTransaction =
                await response.json();


            console.log(
                "Transaction added:",
                newTransaction
            );


            transactionForm.reset();


            await loadTransactions();


        } catch (error) {

            console.error(
                "Error adding transaction:",
                error
            );

            alert(error.message);
        }

    }
);


// ========================================
// Delete Transaction
// ========================================

transactionsList.addEventListener(
    "click",
    async function (event) {

        if (
            !event.target.classList.contains(
                "delete-button"
            )
        ) {
            return;
        }


        const transactionId =
            event.target.dataset.id;


        const confirmed = confirm(
            `Are you sure you want to delete transaction ${transactionId}?`
        );


        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
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
);


// ========================================
// Format Currency
// ========================================

function formatCurrency(amount) {

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
// Capitalize Text
// ========================================

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}


// ========================================
// Basic HTML Escaping
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// ========================================
// Start Application
// ========================================

loadTransactions();