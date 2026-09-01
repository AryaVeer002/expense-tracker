import math
from datetime import datetime

def validate_amount(amount):

    if isinstance(amount, bool):
        return False

    if isinstance(amount, (int, float)):
        if not math.isfinite(amount):
            return False
        
        if amount > 0:
            return True

    return False


def validate_date(date_str):

    try:
        valid_date = datetime.strptime(date_str, "%d/%m/%Y").date()


        today = datetime.today().date()


        if valid_date > today:
            return False

        return True

    except ValueError:
        return False



def validate_category(category):

    if isinstance(category, str):
        category = category.strip()
        
        if category == "":
            return False
        
        return True
    
    return False



def validate_type(transaction_type):

    if isinstance(transaction_type, str):
        transaction_type = transaction_type.strip().lower()

        if transaction_type in ("income", "expense"):
            return True

    return False



def validate_description(description):

    if isinstance(description, str):
        description = description.strip()

        if description == "":
            return True

        word_count = len(description.split())

        if word_count > 100:
            return False

        return True

    return False


def create_transaction(amount, date_str, category, transaction_type, description):
    if not validate_amount(amount):
        raise ValueError("Invalid amount")

    if not validate_date(date_str):
            raise ValueError("Invalid Date")

    
    if not validate_category(category):
            raise ValueError("Invalid Category")

    if not validate_type(transaction_type):
        raise ValueError("Invalid Type")

    if not validate_description(description):
        raise ValueError("Invalid Description")

    category = category.strip()
    transaction_type = transaction_type.strip().lower()
    description = description.strip()

    formatted_date = datetime.strptime(date_str, "%d/%m/%Y").date().isoformat()

    transaction = {
    "amount": amount,
    "date": formatted_date,
    "category": category,
    "type": transaction_type,
    "description": description
    }
    return transaction


def generate_transaction_id(transactions):
    next_id = max(
        (
            transaction["id"]
            for transaction in transactions
            if "id" in transaction
        ),
        default=0
    ) + 1

    return next_id


def add_transaction(transactions, transaction):
    if not isinstance(transaction, dict):
        raise TypeError("Transaction must be Dictionary")

    transaction["id"] = generate_transaction_id(transactions)

    transactions.append(transaction)

