from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import datetime

from src.storage import load_transactions, save_transactions
from src.transactions import (
    create_transaction,
    add_transaction,
    get_transaction_by_id,
    update_transaction,
    delete_transaction,
    patch_transaction   
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionRequest(BaseModel):
    amount: float = Field(gt=0)
    date: str
    category: str = Field(min_length=1)
    type: Literal["income", "expense"]
    description: str = ""

class TransactionUpdateRequest(BaseModel):
    amount: float | None = Field(default=None, gt=0)
    date: str | None = None
    category: str | None = Field(default=None, min_length=1)
    type: Literal["income", "expense"] | None = None
    description: str | None = None
    

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, value):
        for date_format in ("%Y-%m-%d"):
            try:
                parsed_date = datetime.strptime(value, date_format)
                return parsed_date.strftime("%Y-%m-%d")
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



@app.get(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    responses={
        404: {"description": "Transaction not found"}
    }
)
def get_transaction(transaction_id: int):
    transactions = load_transactions()

    transaction = get_transaction_by_id(
        transactions,
        transaction_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction



@app.put(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    responses={
        404: {"description": "Transaction not found"}
    }
)
def update_transaction_api(
    transaction_id: int,
    transaction: TransactionRequest
):
    transactions = load_transactions()

    updated_transaction = update_transaction(
        transactions,
        transaction_id,
        transaction.model_dump()
    )

    if updated_transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    save_transactions(transactions)

    return updated_transaction




@app.delete(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    responses={
        404: {"description": "Transaction not found"}
    }
)
def delete_transaction_api(transaction_id: int):
    transactions = load_transactions()

    deleted_transaction = delete_transaction(
        transactions,
        transaction_id
    )

    if deleted_transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    save_transactions(transactions)

    return deleted_transaction


@app.patch(
    "/transactions/{transaction_id}",
    response_model=TransactionResponse,
    responses={
        404: {"description": "Transaction not found"}
    }
)
def patch_transaction_api(
    transaction_id: int,
    transaction: TransactionUpdateRequest
):
    transactions = load_transactions()

    updates = transaction.model_dump(exclude_unset=True)

    updated_transaction = patch_transaction(
        transactions,
        transaction_id,
        updates
    )

    if updated_transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    save_transactions(transactions)

    return updated_transaction