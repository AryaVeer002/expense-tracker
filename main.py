from src.storage import load_transactions, save_transactions
from src.transactions import create_transaction, add_transaction

transactions = load_transactions()

while True:
    print("\n=== EXPENSE TRACKER ===")
    print("1. Add transaction")
    print("2. View transactions")
    print("3. View balance")
    print("4. View summary")
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


    elif choice == 5:
        print("Goodbye!")
        break