from pathlib import Path
import json
from copy import deepcopy

from src.migration import migrate_transactions



PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_FILE = DATA_DIR / "transactions.json"

DATA_DIR.mkdir(parents=True, exist_ok=True)

def save_transactions(transactions):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(transactions, file, indent=4)



def load_transactions():
    if not DATA_FILE.exists():
        save_transactions([])

    with DATA_FILE.open("r", encoding="utf-8") as file:
        transactions = json.load(file)

    original_transactions = deepcopy(transactions)

    migrate_transactions(transactions)

    if transactions != original_transactions:
        save_transactions(transactions)

    return transactions

