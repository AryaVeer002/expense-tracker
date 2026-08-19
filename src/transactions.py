import math

def validate_amount(amount):

    if isinstance(amount, bool):
        return False
# in python bool is a sub calss of int


    if isinstance(amount, (int, float)):
        if not math.isfinite(amount):
            return False
## Reject infinity and NaN
        
        if amount > 0:
            return True

    return False

from datetime import datetime

def validate_date(date_str):

    try:
        valid_date = datetime.strptime(date_str, "%d/%m/%Y").date()

        #Convert user input into a Python date object

        today = datetime.today().date()

        #Current date

        if valid_date > today:
            return False

        return True

    except ValueError:
        return False