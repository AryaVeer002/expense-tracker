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



def test_get_transaction_by_id(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    response = client.get("/transactions/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["amount"] == 500
    assert data["category"] == "Food"


def test_get_transaction_by_id_not_found(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    response = client.get("/transactions/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found"



def test_update_transaction(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.put(
        "/transactions/1",
        json={
            "amount": 650,
            "date": "02/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["amount"] == 650
    assert data["date"] == "02/09/2026"
    assert data["description"] == "Dinner"

def test_update_transaction_not_found(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.put(
        "/transactions/999",
        json={
            "amount": 650,
            "date": "02/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found"


def test_update_transaction_invalid_amount():
    response = client.put(
        "/transactions/1",
        json={
            "amount": -100,
            "date": "02/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    )

    assert response.status_code == 422

def test_update_transaction_invalid_type():
    response = client.put(
        "/transactions/1",
        json={
            "amount": 650,
            "date": "02/09/2026",
            "category": "Food",
            "type": "shopping",
            "description": "Dinner"
        }
    )

    assert response.status_code == 422



def test_update_transaction_missing_amount():
    response = client.put(
        "/transactions/1",
        json={
            "date": "02/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Dinner"
        }
    )

    assert response.status_code == 422


def test_delete_transaction(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        },
        {
            "id": 2,
            "amount": 1000,
            "date": "01/09/2026",
            "category": "Salary",
            "type": "income",
            "description": "Monthly salary"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.delete("/transactions/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["amount"] == 500
    assert data["category"] == "Food"



def test_delete_transaction_not_found(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.delete("/transactions/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found"



def test_patch_transaction(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.patch(
        "/transactions/1",
        json={
            "description": "Dinner"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["amount"] == 500
    assert data["date"] == "01/09/2026"
    assert data["category"] == "Food"
    assert data["type"] == "expense"
    assert data["description"] == "Dinner"


def test_patch_transaction_not_found(monkeypatch):
    fake_transactions = [
        {
            "id": 1,
            "amount": 500,
            "date": "01/09/2026",
            "category": "Food",
            "type": "expense",
            "description": "Lunch"
        }
    ]

    monkeypatch.setattr(
        "api.main.load_transactions",
        lambda: fake_transactions
    )

    monkeypatch.setattr(
        "api.main.save_transactions",
        lambda transactions: None
    )

    response = client.patch(
        "/transactions/999",
        json={
            "description": "Dinner"
        }
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Transaction not found"



def test_patch_transaction_invalid_amount():
    response = client.patch(
        "/transactions/1",
        json={
            "amount": -100
        }
    )

    assert response.status_code == 422



def test_patch_transaction_invalid_type():
    response = client.patch(
        "/transactions/1",
        json={
            "type": "shopping"
        }
    )

    assert response.status_code == 422