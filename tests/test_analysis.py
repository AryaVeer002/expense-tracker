from src.analysis import calculate_summary, calculate_category_expenses


def test_empty_summary():
    result = calculate_summary([])

    assert result == {
        "income": 0,
        "expenses": 0,
        "balance": 0
    }

def test_summary_with_transactions():
    transactions = [
        {
            "amount": 5000,
            "type": "income"
        },
        {
            "amount": 500,
            "type": "expense"
        },
        {
            "amount": 200,
            "type": "expense"
        }
    ]

    result = calculate_summary(transactions)

    assert result == {
        "income": 5000,
        "expenses": 700,
        "balance": 4300
    }

def test_income_only():
    transactions = [
        {
            "amount": 5000,
            "type": "income"
        }
    ]

    result = calculate_summary(transactions)

    assert result == {
        "income": 5000,
        "expenses": 0,
        "balance": 5000
    }

def test_expense_only():
    transactions = [
        {
            "amount": 1500,
            "type": "expense"
        }
    ]

    result = calculate_summary(transactions)

    assert result == {
        "income": 0,
        "expenses": 1500,
        "balance": -1500
    }

def test_multiple_transactions():
    transactions = [
        {"amount": 10000, "type": "income"},
        {"amount": 5000, "type": "income"},
        {"amount": 1200, "type": "expense"},
        {"amount": 800, "type": "expense"},
        {"amount": 500, "type": "expense"},
    ]

    result = calculate_summary(transactions)

    assert result == {
        "income": 15000,
        "expenses": 2500,
        "balance": 12500
    }




def test_category_expenses_empty():
    result = calculate_category_expenses([])

    assert result == {}

def test_category_expenses():
    transactions = [
        {
            "amount": 500,
            "category": "Food",
            "type": "expense"
        },
        {
            "amount": 300,
            "category": "Travel",
            "type": "expense"
        },
        {
            "amount": 250,
            "category": "Food",
            "type": "expense"
        },
        {
            "amount": 5000,
            "category": "Salary",
            "type": "income"
        }
    ]

    result = calculate_category_expenses(transactions)

    assert result == {
        "Food": 750,
        "Travel": 300
    }

