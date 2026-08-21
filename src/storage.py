from pathlib import Path
import json

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_FILE = DATA_DIR / "transactions.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

def save_transactions(transactions):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(transactions, file, indent=4)


# if __name__ == "__main__":
#     transactions = [
#         {
#             "amount": 250,
#             "date": "2026-08-17",
#             "category": "Food",
#             "type": "expense",
#             "description": "Dinner"
#         }
#     ]

#     save_transactions(transactions)

#     print("Transactions saved successfully.")

def load_transactions():
    if not DATA_FILE.exists():
        save_transactions([])

    with DATA_FILE.open("r", encoding="utf-8") as file:
        transactions = json.load(file)

    return transactions


# if __name__ == "__main__":
#     transactions = [
#         {
#             "amount": 250,
#             "date": "2026-08-17",
#             "category": "Food",
#             "type": "expense",
#             "description": "Dinner"
#         }
#     ]

#     save_transactions(transactions)

#     loaded_transactions = load_transactions()

#     print("Saved:", transactions)
#     print("Loaded:", loaded_transactions)
#     print("Same data:", transactions == loaded_transactions)