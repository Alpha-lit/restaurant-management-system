# Restaurant Management System 🍽️
A full-featured **Restaurant Management System** built with **Django (backend)** and **React (frontend)**, designed to streamline restaurant operations, from order processing to inventory tracking and reporting.

---

## Features

### 1. Order Management
- Orders sent to kitchen → Chef prepares  
- Food ready → Waiter serves  
- Customer finished → Cashier processes payment  
- Payment complete → Order marked as paid  

### 2. Inventory Tracking
- Automatic deduction when orders are placed  
- Manual adjustments for waste/spoilage  
- Reorder alerts when stock is low  
- Transaction history for auditing  

### 3. Reporting & Analytics
- Daily sales totals and order counts  
- Most popular dishes by order count  
- Revenue analysis by period  
- Inventory usage reports  

---

## Technologies Used
- **Backend:** Django, Django REST Framework, SQLite/PostgreSQL  
- **Frontend:** React, JavaScript, HTML, CSS  
- **Other Tools:** Git, VS Code, Bootstrap  

---

## Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
### Frontend
```bash
cd front-end/restaurant-frontend
npm install
npm start
```
### Usage
#### 1. Place orders through the frontend interface
#### 2. Track inventory automatically as orders are processed
#### 3. Monitor daily sales and generate reports from the dashboard
---
## Project Structure
```bash
restaurant-management-system/
│
├── backend/                 # Django backend
│   ├── manage.py
│   ├── app/
│   └── ...
│
└── front-end/restaurant-frontend/  # React frontend
    ├── src/
    ├── public/
    └── package.json
```

