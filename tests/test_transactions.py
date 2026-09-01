from datetime import datetime
from src.transactions import (
    validate_amount,
    validate_date,
    validate_category,
    validate_type,
    validate_description,
    create_transaction,
    add_transaction,
    generate_transaction_id,
)


def test_valid_amount():
    assert validate_amount(250) is True
    assert validate_amount(250.5) is True


def test_invalid_amount():
    assert validate_amount(0) is False
    assert validate_amount(-50) is False
    assert validate_amount("250") is False
    assert validate_amount(True) is False
    assert validate_amount(float("inf")) is False
    assert validate_amount(float("nan")) is False



def test_valid_date():
    assert validate_date("15/8/2026") is True

def test_today_date():
    today = datetime.today().strftime("%d/%m/%Y")
    assert validate_date(today) is True

def test_invalid_date():
    assert validate_date("30/10/2026") is False
    assert validate_date("31/02/2026") is False
    assert validate_date("hello") is False
    assert validate_date("19-08-2026") is False



def test_valid_category():
    assert validate_category("Food") is True
    assert validate_category("Gaming") is True
    assert validate_category("My Hobby") is True


def test_invalid_category():
    assert validate_category("") is False
    assert validate_category("   ") is False
    assert validate_category(None) is False
    assert validate_category(250) is False






def test_valid_type():
    assert validate_type("income") is True
    assert validate_type("expense") is True
    assert validate_type("INCOME") is True
    assert validate_type(" Expense ") is True


def test_invalid_type():
    assert validate_type("") is False
    assert validate_type("   ") is False
    assert validate_type("salary") is False
    assert validate_type("profit") is False
    assert validate_type(None) is False
    assert validate_type(250) is False



def test_valid_description():
    assert validate_description("Dinner") is True
    assert validate_description("Bought a new keyboard") is True
    assert validate_description("") is True
    assert validate_description("   ") is True


def test_invalid_description():
    assert validate_description(None) is False
    assert validate_description(250) is False

    long_description = "word " * 101
    assert validate_description(long_description) is False




def test_create_transaction():
    transaction = create_transaction(
        250,
        "17/08/2026",
        " Food ",
        " EXPENSE ",
        " Dinner "
    )

    assert transaction == {
        "amount": 250,
        "date": "2026-08-17",
        "category": "Food",
        "type": "expense",
        "description": "Dinner"
    }

import pytest

def test_create_transaction_invalid_amount():
    with pytest.raises(ValueError):
        create_transaction(
            -250,
            "17/08/2026",
            "Food",
            "expense",
            "Dinner"
        )


def test_add_transaction():
    transactions = []

    transaction = create_transaction(
        250,
        "17/08/2026",
        "Food",
        "expense",
        "Dinner"
    )

    add_transaction(transactions, transaction)

    assert len(transactions) == 1
    assert transactions[0] == transaction

def test_add_transaction_wrong_type():
    transactions = []

    with pytest.raises(TypeError):
        add_transaction(transactions, 250)




def test_generate_transaction_id_empty():
    transactions = []

    assert generate_transaction_id(transactions) == 1


def test_generate_transaction_id_existing_transactions():
    transactions = [
        {"id": 1},
        {"id": 2},
        {"id": 3}
    ]

    assert generate_transaction_id(transactions) == 4


def test_generate_transaction_id_missing_id():
    transactions = [
        {"id": 1},
        {"id": 3}
    ]

    assert generate_transaction_id(transactions) == 4




def test_add_transaction_assigns_id():
    transactions = []

    transaction = create_transaction(
        amount=500,
        date_str="26/08/2026",
        category="Food",
        transaction_type="expense",
        description="Lunch"
    )

    add_transaction(transactions, transaction)

    assert transactions[0]["id"] == 1



def test_add_transaction_assigns_next_id():
    transactions = [
        {"id": 1},
        {"id": 2}
    ]

    transaction = create_transaction(
        amount=500,
        date_str="26/08/2026",
        category="Food",
        transaction_type="expense",
        description="Lunch"
    )

    add_transaction(transactions, transaction)

    assert transactions[-1]["id"] == 3
