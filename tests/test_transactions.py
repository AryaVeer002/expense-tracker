from datetime import datetime
from src.transactions import validate_amount, validate_date, validate_category


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
    assert validate_date("30/08/2026") is False
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