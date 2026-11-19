# FoodHub Frontend

React frontend + Node.js/Express API gateway for the FoodHub Spring Boot backend.

React (5173) -> Node gateway (4000) -> Spring Boot (8080) -> MySQL + MongoDB

## Run

1. Start MySQL, MongoDB and the Spring Boot backend (needs the JWT_SECRET environment variable).
2. Gateway: cd gateway && npm install && npm run dev
3. Frontend: cd frontend && npm install && npm run dev
4. Open http://localhost:5173

Copy gateway/.env.example to gateway/.env before the first run.
