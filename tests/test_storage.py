import json
from src.storage import save_transactions, load_transactions
from src.transactions import create_transaction, add_transaction
import src.storage as storage



def test_tmp_file(tmp_path):
    file_path = tmp_path / "transactions.json"

    print("Temporary directory:", tmp_path)
    print("Temporary file:", file_path)

    assert file_path.exists() is False

def test_monkeypatch_data_file(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    print("Patched DATA_FILE:", storage.DATA_FILE)

    assert storage.DATA_FILE == test_file


def test_save_transactions(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    transactions = [
        {
            "amount": 250,
            "date": "2026-08-17",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    ]

    storage.save_transactions(transactions)

    assert test_file.exists() is True


def test_save_transactions(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    transactions = [
        {
            "amount": 250,
            "date": "2026-08-17",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    ]

    storage.save_transactions(transactions)

    assert test_file.exists() is True

    with test_file.open("r", encoding="utf-8") as file:
        saved_data = json.load(file)

    assert saved_data == transactions


def test_load_transactions(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    transactions = [
        {
            "amount": 250,
            "date": "2026-08-17",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    ]

    with test_file.open("w", encoding="utf-8") as file:
        json.dump(transactions, file, indent=4)

    loaded_transactions = load_transactions()

    assert loaded_transactions == transactions




def test_load_transactions_when_file_does_not_exist(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    loaded_transactions = load_transactions()

    assert loaded_transactions == []
    assert test_file.exists() is True



def test_multiple_transactions(tmp_path, monkeypatch):
    test_file = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", test_file)

    transactions = [
        {
            "amount": 250,
            "date": "2026-08-17",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        },
        {
            "amount": 1000,
            "date": "2026-08-18",
            "category": "Salary",
            "type": "income",
            "description": "Part-time work"
        },
        {
            "amount": 120,
            "date": "2026-08-19",
            "category": "Travel",
            "type": "expense",
            "description": "Bus"
        }
    ]

    save_transactions(transactions)

    loaded_transactions = load_transactions()

    assert loaded_transactions == transactions


def test_transaction_persistence(tmp_path, monkeypatch):
    transactions = []

    transaction = create_transaction(
        amount=500,
        date_str="22/08/2026",
        category="Food",
        transaction_type="expense",
        description="Lunch"
    )

    add_transaction(transactions, transaction)

    file_path = tmp_path / "transactions.json"

    monkeypatch.setattr(storage, "DATA_FILE", file_path)

    save_transactions(transactions)

    loaded_transactions = load_transactions()

    assert loaded_transactions == transactions