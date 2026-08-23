from src.storage import load_transactions, save_transactions
from src.transactions import create_transaction, add_transaction
from src.analysis import calculate_summary, calculate_category_expenses

transactions = load_transactions()

while True:
    print("\n=== EXPENSE TRACKER ===")
    print("1. Add transaction")
    print("2. View transactions")
    print("3. Financial summary")
    print("4. Spending analysis")
    print("5. Exit")

    try:
        choice = int(input("Choose an option: "))
    except ValueError:
        print("Please enter a number between 1 and 5.")
        continue

    if choice < 1 or choice > 5:
        print("Please enter a number between 1 and 5.")
        continue

    if choice == 1:
        try:
            amount = int(input("Enter amount: "))
            date_str = input("Enter date (DD/MM/YYYY): ")
            category = input("Enter category: ")
            transaction_type = input("Enter type (income/expense): ")
            description = input("Enter description: ")


            transaction = create_transaction(amount,
                date_str,
                category,
                transaction_type,
                description
                )

            add_transaction(transactions, transaction)
            save_transactions(transactions)

            print("Transaction added successfully!")

        except ValueError as error:
            print(f"Error: {error}")


    elif choice == 2:
        if not transactions:
            print("No transactions found.")
            continue

        print("\n========== TRANSACTIONS ==========")

        for index, transaction in enumerate(transactions, start=1):
            print(f"\n{index}. {transaction['category']}")
            print(f"   Amount: ₹{transaction['amount']}")
            print(f"   Date: {transaction['date']}")
            print(f"   Type: {transaction['type'].title()}")
            print(f"   Description: {transaction['description']}")

        print("\n==================================")

    elif choice == 3:
        summary = calculate_summary(transactions)

        print("\n========== FINANCIAL SUMMARY ==========")
        print(f"Total Income:   ₹{summary['income']}")
        print(f"Total Expenses: ₹{summary['expenses']}")
        print(f"Balance:        ₹{summary['balance']}")
        print("=======================================")

    elif choice == 4:
        category_expenses = calculate_category_expenses(transactions)

        if not category_expenses:
            print("\nNo expenses found.")
            continue

        print("\n========== SPENDING BY CATEGORY ==========")

        for category, amount in category_expenses.items():
            print(f"{category}: ₹{amount}")

        print("==========================================")

        


    elif choice == 5:
        print("Goodbye!")
        break