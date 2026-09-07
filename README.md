# ORBIT_AI
<h1>Project Overview</h1>
<p>This project is an AI‑powered chatbot application that combines natural language processing and machine learning to deliver an interactive conversational experience.</p>

## Project Structure
The repository is organized into two main components:

- **Backend** – server‑side logic, database interactions, and API routing.
- **Frontend** – client‑side UI built with React.

### Backend
Implemented in Python with FastAPI. Key parts include:

- **Database Models** – defined in `backend/models/database_models.py` and `backend/models/User_Model.py`.
- **Controllers** – business logic for the chatbot, located in `backend/controllers/Chat_controller.py`.
- **Utils** – helper functions for database operations, text extraction, etc., under `backend/utils/`.
- **Routers** – API endpoints, e.g., `backend/routers/Chat_route.py`.
- **Lib** – configuration for Groq models, database connections, and Cloudinary in `backend/lib/`.

### Frontend
Built with React. Main directories:

- **Components** – UI components in `frontend/src/pages/` and `frontend/src/`.
- **Assets** – static files such as images in `frontend/src/assets/`.
- **Styles** – global CSS in `frontend/src/index.css`.

## Installation
Follow these steps to get the project running locally:

1. Clone the repository.  
2. Navigate to the project root.  
3. Ensure **Docker** and **Docker Compose** are installed.  
4. (Optional) Create a `.env` file inside `backend/` with the required variables. Use `backend/.env.example` as a reference if it exists.  
5. Build and start the containers:

```bash
docker-compose up --build
```

6. To stop the services, run:

```bash
docker-compose down
```

## Usage
1. Open a browser and go to `http://localhost:3000` to view the frontend.  
2. The FastAPI backend is reachable at `http://localhost:8000`.  
3. Interact with the chatbot through the UI; messages are sent to the unified chat endpoint (`POST /chat/`) which persists conversation data in PostgreSQL.

<h1>Badges</h1>
<!-- Badges will be added here -->