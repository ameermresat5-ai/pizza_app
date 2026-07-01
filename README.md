# Pizza Ordering System

Student 1: Ramiz Dweiry  
Student 1 ID: 208131557

Student 2: Ameer Mresat  
Student 2 ID: 212873368

## Repository Link

GitHub repository: https://github.com/ameermresat5-ai/pizza_app

## Overview
This simple pizza ordering system uses a Node.js + Express backend and a React + Vite frontend. All orders are stored in server memory only. No database or authentication is used.

## Install and Run
### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

The client will call the server at http://localhost:3001/api.

## Server Endpoints
- GET /api/menu
- POST /api/orders
- GET /api/orders/:id
- GET /api/orders?status=<status>
- PATCH /api/orders/:id/status

## Notes
- Prices are calculated on the server only.
- A customer cannot choose the same topping twice for the same pizza.
- Status flow: new -> preparing -> ready -> delivered.

## Questions
1. What is the difference between client side and server side in this system?  
   The client shows the UI and collects user input, while the server validates orders, calculates prices, and stores order state in memory.

2. Where is the total price calculated and why?  
   The total price is calculated on the server to prevent clients from changing prices.

3. Where is the order status saved?  
   The order status is saved in the server memory array.

4. What happens after successful payment?  
   In this simple system, the order is accepted with paymentStatus = approved and moves through the status flow.

5. What was the personal rule?  
   The same topping cannot be selected twice for the same pizza.

6. What was hard in this exercise?  
   Keeping the flow simple while matching the required API behavior and status transitions.

7. Which design decision did you make from HW1 and why?  
   I used a simple three-role UI (Customer, Employee, Delivery) to match the homework workflow and keep the system beginner-friendly.
