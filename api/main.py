from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import datetime

from src.storage import load_transactions, save_transactions
from src.transactions import create_transaction, add_transaction

app = FastAPI()


class TransactionRequest(BaseModel):
    amount: float = Field(gt=0)
    date: str
    category: str = Field(min_length=1)
    type: Literal["income", "expense"]
    description: str = ""
    

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, value):
        for date_format in ("%d/%m/%Y", "%Y-%m-%d"):
            try:
                parsed_date = datetime.strptime(value, date_format)
                return parsed_date.strftime("%d/%m/%Y")
            except ValueError:
                continue

        raise ValueError(
            "Date must be in DD/MM/YYYY or YYYY-MM-DD format"
        )


class TransactionResponse(BaseModel):
    id: int
    amount: float
    date: str
    category: str
    type: Literal["income", "expense"]
    description: str


@app.get("/")
def home():
    return {"message": "Expense Tracker API is running"}


@app.get(
    "/transactions",
    response_model=list[TransactionResponse]
)
def get_transactions():
    return load_transactions()


@app.post(
    "/transactions",
    response_model=TransactionResponse,
    responses={
        400: {
            "description": "Invalid transaction data"
        }
    }
)
def create_transaction_api(transaction: TransactionRequest):
    try:
        transactions = load_transactions()

        new_transaction = create_transaction(
            amount=transaction.amount,
            date_str=transaction.date,
            category=transaction.category,
            transaction_type=transaction.type,
            description=transaction.description
        )

        add_transaction(transactions, new_transaction)
        save_transactions(transactions)

        return new_transaction

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )