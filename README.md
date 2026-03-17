🧠 KnowledgeAI
Chat with your documents using AI — Upload PDFs and text files, ask questions, and get instant intelligent answers powered by Groq LLaMA 3.3 70B.

Frontend (Vercel): https://your-app.vercel.app
Backend API (Render): https://knowledgeai-assisstent.onrender.com/docs
Features
Document Management
Upload PDF and TXT files to your personal knowledge base
Search and filter documents instantly
Delete documents anytime
Supports multiple documents simultaneously
Auto-extracts and indexes text content
AI Chat (Powered by Groq LLaMA 3.3 70B)
Ask natural language questions about your documents
AI searches across ALL uploaded documents at once
Conversation memory — AI remembers last 6 messages for context
Deep question understanding — understands intent, not just keywords
Structured answers — bullet points, summaries, step-by-step based on question type
Cross-references information from multiple files
Premium UI
Animated floating particles background
Dark / Light mode with persistent toggle
Animated stats counters
Live document search bar
Storage usage tracker
Smooth hover animations and transitions
Responsive design
Authentication
Secure JWT-based login and registration
Token stored in localStorage
Auto-redirect on session expiry

Tech Stack
Layer

Technology

Frontend
React 18, Vite, React Router v6, Axios
Backend
FastAPI, Python 3.14, Uvicorn
Database
PostgreSQL via Neon (Cloud)
AI Model
Groq LLaMA 3.3 70B Versatile
Auth
JWT (JSON Web Tokens) + Passlib bcrypt
ORM
SQLAlchemy + Alembic
Deployment
Vercel (Frontend) + Render (Backend)

Project Structure

KnowledgeAI/
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── Register.jsx      # Registration page
│   │   │   ├── Dashboard.jsx     # Document management
│   │   │   └── Chat.jsx          # AI chat interface
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # App entry point + CORS
│   │   ├── database.py           # DB connection
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── auth.py           # Login + Register
│   │   │   ├── documents.py      # Upload + Delete + List
│   │   │   └── chat.py           # AI question answering
│   │   └── services/
│   │       ├── ai_service.py     # Groq LLaMA integration
│   │       └── document_service.py # PDF/TXT text extraction
│   └── requirements.txt
│
└── README.md

Local Setup

Prerequisites
Python 3.10+
Node.js 18+
PostgreSQL database (or Neon free cloud)
Groq API key from console.groq.com
1. Clone the repository
git clone https://github.com/ChukkaCharitha/project.git
cd project
2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
Create .env file inside /backend:
DATABASE_URL=your_neon_postgresql_url
SECRET_KEY=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
Run backend:
uvicorn app.main:app --reload
3. Frontend setup
cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser.
Environment Variables
Backend (backend/.env)
Variable
Description
Where to get
DATABASE_URL
PostgreSQL connection string
neon.tech
SECRET_KEY
JWT signing secret
Any random string
GROQ_API_KEY
Groq AI API key
console.groq.com
Deployment
Service
Platform
Config
Frontend
Vercel
Root: frontend, Framework: Vite
Backend
Render
Root: backend, Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Database
Neon
Cloud PostgreSQL — always live
 Recent Updates
v2.0 — Latest
 Fixed document upload bug (multipart form data)
 AI now searches across ALL documents simultaneously
 Added conversation memory (last 6 messages context)
 Improved AI prompt for deeper question understanding
 Auto-formats answers based on question type
 Premium Dashboard UI with particles and animations
 Live document search bar added
 Storage usage tracker added
 Better error handling and token expiry detection
v1.0 — Initial Release
 Core upload, chat, auth functionality
 Dark/Light mode
 Deployed on Render + Vercel
 Author
Charitha Chukka
GitHub: @ChukkaCharitha
 License
This project is open source and available under the MIT License.

Built with  using FastAPI + React + Groq LLaMA 3.3 70B
