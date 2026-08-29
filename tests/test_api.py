from fastapi.testclient import TestClient

import api.main


client = TestClient(api.main.app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Expense Tracker API is running"
    }

def test_get_transactions():
    response = client.get("/transactions")

    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_transaction():
    transaction = {
        "amount": 500,
        "date": "26/08/2026",
        "category": "Food",
        "type": "expense",
        "description": "Lunch"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 200

    result = response.json()

    assert result["amount"] == 500
    assert result["date"] == "26/08/2026"
    assert result["category"] == "Food"
    assert result["type"] == "expense"
    assert result["description"] == "Lunch"




def test_create_transaction(monkeypatch):

    fake_transactions = []

    def fake_load_transactions():
        return fake_transactions

    def fake_save_transactions(transactions):
        pass

    monkeypatch.setattr(
        api.main,
        "load_transactions",
        fake_load_transactions
    )

    monkeypatch.setattr(
        api.main,
        "save_transactions",
        fake_save_transactions
    )


    transaction = {
        "amount": 500,
        "date": "26/08/2026",
        "category": "Food",
        "type": "expense",
        "description": "Lunch"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 200

    result = response.json()

    assert result["amount"] == 500
    assert result["category"] == "Food"
    assert result["type"] == "expense"
    assert result["description"] == "Lunch"



def test_create_transaction_invalid_amount():
    transaction = {
        "amount": -500,
        "date": "26/08/2026",
        "category": "Food",
        "type": "expense",
        "description": "Invalid amount"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 422


def test_create_transaction_invalid_type():
    transaction = {
        "amount": 500,
        "date": "26/08/2026",
        "category": "Food",
        "type": "banana",
        "description": "Invalid type"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 422



def test_create_transaction_future_date(monkeypatch):
    fake_transactions = []

    def fake_load_transactions():
        return fake_transactions

    def fake_save_transactions(transactions):
        pass

    monkeypatch.setattr(
        api.main,
        "load_transactions",
        fake_load_transactions
    )

    monkeypatch.setattr(
        api.main,
        "save_transactions",
        fake_save_transactions
    )

    transaction = {
        "amount": 500,
        "date": "31/12/2099",
        "category": "Food",
        "type": "expense",
        "description": "Future expense"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Invalid Date"
    }




def test_create_transaction_whitespace_category(monkeypatch):
    fake_transactions = []

    def fake_load_transactions():
        return fake_transactions

    def fake_save_transactions(transactions):
        pass

    monkeypatch.setattr(
        api.main,
        "load_transactions",
        fake_load_transactions
    )

    monkeypatch.setattr(
        api.main,
        "save_transactions",
        fake_save_transactions
    )

    transaction = {
        "amount": 500,
        "date": "26/08/2026",
        "category": "   ",
        "type": "expense",
        "description": "Dinner"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Invalid Category"
    }

    

def test_create_transaction_without_description(monkeypatch):
    fake_transactions = []

    def fake_load_transactions():
        return fake_transactions

    def fake_save_transactions(transactions):
        pass

    monkeypatch.setattr(
        api.main,
        "load_transactions",
        fake_load_transactions
    )

    monkeypatch.setattr(
        api.main,
        "save_transactions",
        fake_save_transactions
    )

    transaction = {
        "amount": 500,
        "date": "26/08/2026",
        "category": "Food",
        "type": "expense"
    }

    response = client.post(
        "/transactions",
        json=transaction
    )

    assert response.status_code == 200

    result = response.json()

    assert result["description"] == ""