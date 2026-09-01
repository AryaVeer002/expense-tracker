from src.migration import migrate_transactions


def test_migrate_empty_transactions():
    transactions = []

    result = migrate_transactions(transactions)

    assert result == []


def test_migrate_existing_ids():
    transactions = [
        {"id": 1, "amount": 250},
        {"id": 2, "amount": 500}
    ]

    result = migrate_transactions(transactions)

    assert result == transactions


def test_migrate_missing_ids():
    transactions = [
        {"amount": 250},
        {"amount": 500}
    ]

    result = migrate_transactions(transactions)

    assert result[0]["id"] == 1
    assert result[1]["id"] == 2


def test_migrate_mixed_ids():
    transactions = [
        {"id": 1, "amount": 250},
        {"amount": 500},
        {"id": 3, "amount": 750},
        {"amount": 100}
    ]

    result = migrate_transactions(transactions)

    assert result[0]["id"] == 1
    assert result[1]["id"] == 4
    assert result[2]["id"] == 3
    assert result[3]["id"] == 5


def test_migrate_no_duplicate_ids():
    transactions = [
        {"id": 1},
        {"amount": 200},
        {"id": 3},
        {"amount": 400}
    ]

    result = migrate_transactions(transactions)

    ids = [transaction["id"] for transaction in result]

    assert len(ids) == len(set(ids))