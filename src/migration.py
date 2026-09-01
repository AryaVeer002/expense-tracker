from src.transactions import generate_transaction_id
from copy import deepcopy


def migrate_transactions(transactions):
    migrated = False

    for transaction in transactions:
        if "id" not in transaction:
            transaction["id"] = generate_transaction_id(transactions)
            migrated = True

    return transactions#, migrated