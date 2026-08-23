def calculate_summary(transactions):
    income = 0
    expense = 0

    for transaction in transactions:
        if transaction["type"] == "income":
            income += transaction["amount"]

        elif transaction["type"] == "expense":
            expense += transaction["amount"]

    balance = income - expense

    return {
        "income": income,
        "expenses": expense,
        "balance": balance
    }



def calculate_category_expenses(transactions):
    category_totals = {}

    for transaction in transactions:
        if transaction["type"] == "expense":
            category = transaction["category"]

            if category not in category_totals:
                category_totals[category] = 0

            category_totals[category] += transaction["amount"]

    return category_totals

