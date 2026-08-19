# ORBIT_AI
<h1>Project Overview</h1>
<p>This project is an AI‑powered chatbot application, utilizing a combination of natural language processing and machine learning to provide an interactive experience.</p>

## Project Structure
The project is divided into two main components: 
- **Backend**: Handles the server‑side logic, database interactions, and API routing.
- **Frontend**: Handles the client‑side logic, user interface, and user experience.

### Backend
The backend is built using Python, with the following key features:
- **Database Models**: Defined in `backend/models/database_models.py` and `backend/models/User_Model.py`
- **Controllers**: Handle API requests and interactions, defined in `backend/controllers/Chat_controller.py`
- **Utils**: Various utility functions for database interactions, text extraction, and more, defined in `backend/utils/`
- **Routers**: Define API routes, defined in `backend/routers/Chat_route.py`
- **Lib**: Configuration files for Groq models, database, Groq, and Cloudinary, defined in `backend/lib/`

### Frontend
The frontend is built using React, with the following key features:
- **Components**: Defined in `frontend/src/pages/` and `frontend/src/`
- **Assets**: Static assets, such as images, defined in `frontend/src/assets/`
- **Styles**: CSS styles, defined in `frontend/src/index.css`

## Installation
To install the project, follow these steps:
1. Clone the repository.  
2. Navigate to the project directory.  
3. Ensure Docker and Docker Compose are installed on your machine.  

## Usage
To use the application, follow these steps:
1. Open a web browser and navigate to `http://localhost:3000`
2. Interact with the chatbot by sending messages and receiving responses

<h1>Badges</h1>
<!-- Badges will be added here -->