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

2. Navigate to the project directory.  
3. Ensure Docker and Docker Compose are installed on your machine.  
4. (Optional) Create a `.env` file in `backend/` with the required environment variables (refer to `backend/.env.example` if available).  
5. Run `docker-compose up --build` to build and start the containers.

## Usage
1. Open a web browser and navigate to `http://localhost:3000` (frontend).  
2. The backend API is available at `http://localhost:8000`.  
3. Interact with the chatbot by sending messages and receiving responses through the UI.

<h1>Badges</h1>
<!-- Badges will be added here -->