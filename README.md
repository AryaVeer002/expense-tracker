# Expense Tracker

A full-stack expense tracking application built with Python, FastAPI, HTML, CSS, and JavaScript.

The project started as a Python-based expense tracker and was extended into a REST API with a browser-based dashboard for managing transactions, analyzing spending, and viewing financial summaries.

---

## Features

### Transaction Management

- Add income and expense transactions
- View all transactions
- Edit existing transactions
- Delete transactions
- Partial transaction updates using PATCH
- Automatic transaction ID generation
- JSON-based persistent storage

### Search, Filter & Sort

- Search transactions by category or description
- Filter by transaction type
- Filter by category
- Filter by date range
- Sort by newest first
- Sort by oldest first
- Sort by highest amount
- Sort by lowest amount
- Clear all filters

### Financial Dashboard

- Total balance
- Total income
- Total expenses
- Transaction count
- Filter-aware financial summary

### Analytics

- Expense breakdown by category
- Income vs expenses comparison
- Monthly expense analysis
- Dynamic chart updates based on filters
- Currency-formatted chart tooltips
- Empty states when no matching data exists

### Validation and UX

- Frontend form validation
- Backend validation with Pydantic
- Transaction data validation
- Date validation
- Protection against future transaction dates
- Loading states
- Error states
- Success and error toast notifications
- Unsaved edit confirmation
- Responsive dashboard layout

### Testing

- Automated tests using pytest
- API tests
- Transaction logic tests
- Storage tests
- Migration tests
- Analytics tests

Current test status:

**67 tests passed**

---

## Tech Stack

### Backend

- Python 3.12
- FastAPI
- Pydantic
- Uvicorn

### Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js

### Data Storage

- JSON

### Testing

- pytest

### Development Tools

- Visual Studio Code
- Git
- GitHub

---

## Project Structure

```text
expense-tracker/
|
+-- api/
|   +-- main.py
|
+-- data/
|   +-- transactions.json
|
+-- frontend/
|   +-- index.html
|   +-- script.js
|   +-- style.css
|
+-- src/
|   +-- __init__.py
|   +-- analysis.py
|   +-- migration.py
|   +-- storage.py
|   +-- transactions.py
|
+-- tests/
|   +-- test_analysis.py
|   +-- test_api.py
|   +-- test_migration.py
|   +-- test_storage.py
|   +-- test_transactions.py
|
+-- main.py
+-- requirements.txt
+-- README.md
+-- .gitignore