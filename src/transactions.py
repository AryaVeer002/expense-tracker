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

