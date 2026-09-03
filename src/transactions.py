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


from datetime import datetime, date


def parse_date(date_str):
    formats = [
        "%Y-%m-%d",   # HTML date input
        "%d/%m/%Y"    # Existing project format
    ]

    for date_format in formats:
        try:
            return datetime.strptime(
                date_str,
                date_format
            ).date()

        except ValueError:
            continue

    return None


def validate_date(date_str):
    transaction_date = parse_date(date_str)

    if transaction_date is None:
        return False

    if transaction_date > date.today():
        return False

    return True



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


def create_transaction(
    amount,
    date_str,
    category,
    transaction_type,
    description=""
):
    if not validate_amount(amount):
        raise ValueError("Invalid Amount")

    if not validate_date(date_str):
        raise ValueError("Invalid Date")

    if not validate_category(category):
        raise ValueError("Invalid Category")

    if not validate_type(transaction_type):
        raise ValueError("Invalid Type")

    if not validate_description(description):
        raise ValueError("Invalid Description")

    formatted_date = parse_date(date_str).isoformat()

    return {
        "amount": amount,
        "date": formatted_date,
        "category": category.strip(),
        "type": transaction_type.strip().lower(),
        "description": description.strip()
    }

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



def get_transaction_by_id(transactions, transaction_id):
    for transaction in transactions:
        if transaction["id"] == transaction_id:
            return transaction

    return None



def update_transaction(transactions, transaction_id, updated_transaction):
    for transaction in transactions:
        if transaction["id"] == transaction_id:
            transaction["amount"] = updated_transaction["amount"]
            transaction["date"] = updated_transaction["date"]
            transaction["category"] = updated_transaction["category"]
            transaction["type"] = updated_transaction["type"]
            transaction["description"] = updated_transaction["description"]
            return transaction

    return None


def delete_transaction(transactions, transaction_id):
    for transaction in transactions:
        if transaction["id"] == transaction_id:
            transactions.remove(transaction)
            return transaction

    return None


def patch_transaction(transactions, transaction_id, updates):
    for transaction in transactions:
        if transaction["id"] == transaction_id:
            for field, value in updates.items():
                if field != "id":
                    transaction[field] = value

            return transaction

    return None