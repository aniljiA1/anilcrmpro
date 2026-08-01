# CRM Pro — AI Powered CRM

A full-stack CRM application:
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI API (GPT-4o-mini) — chat assistant, AI lead scoring, email draft generator, contact notes summarizer

## Features
- 🔐 JWT authentication (Register / Login)
- 👤 Contact management (CRUD + search)
- 🎯 Lead management (CRUD, pipeline status, **AI lead scoring**)
- 🤝 Deal management (CRUD, pipeline stages, amounts, close dates)
- 🧾 Invoice management (line items, tax/discount, auto invoice numbering, status tracking, **PDF download**, **email invoice to contact**)
- 📤 CSV export for Contacts, Leads, and Deals
- 📜 Activity Log (timeline of calls, emails, meetings, notes — auto-logged on key CRM events + manual entries)
- ✅ Task management (CRUD, priority, due dates, complete/incomplete)
- 📊 Dashboard with stats & charts (pipeline value, won value, outstanding/total invoiced, leads by status, deals by stage)
- 🤖 AI Assistant page — chat with an AI CRM assistant + AI email generator
- ✨ AI contact notes summarizer

## Project Structure
```
crm-project/
├── backend/          # Node.js + Express API
│   ├── config/       # MongoDB connection
│   ├── models/       # Mongoose schemas (User, Contact, Lead, Deal, Task)
│   ├── controllers/  # Route logic incl. OpenAI integration
│   ├── middleware/   # Auth (JWT) + error handling
│   ├── routes/       # Express routers
│   └── server.js
└── frontend/         # React + Vite app
    └── src/
        ├── api/          # Axios instance
        ├── context/      # Auth context
        ├── components/   # Sidebar, Navbar, Loader, ProtectedRoute
        ├── layouts/       # MainLayout
        └── pages/        # Login, Register, Dashboard, Contacts, Leads, Deals, Tasks, AIAssistant
```

## Setup Instructions

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas connection string)
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run dev
```
Backend runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env if your backend runs elsewhere
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### 4. (Optional) Seed Demo Data
Want the app to look populated with realistic data right away (great for demos)? After registering at least one user, run:
```bash
cd backend
npm run seed
```
This adds 7 contacts, 8 leads (with AI scores), 6 deals across different stages, and 8 tasks — all tied to your first registered user. Re-running it clears and re-seeds cleanly. To seed a specific user instead of the first one found:
```bash
node seed.js user@email.com
```

### 5. First Use
1. Open `http://localhost:5173`
2. Click **Register** to create your first account
3. Start adding Contacts, Leads, and Deals
4. Try the **AI Assistant** tab to chat, generate emails, or score leads with AI

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crm_db
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-api-key-here
CLIENT_URL=http://localhost:5173

# Optional — only needed for the "Email Invoice" feature
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

> **Setting up Gmail SMTP:** Enable 2-Step Verification on your Google account, then create an [App Password](https://myaccount.google.com/apppasswords) (16 characters) — use that as `SMTP_PASS`, not your regular Gmail password. Any other SMTP provider (Outlook, SendGrid, Mailgun, etc.) works too — just change `SMTP_HOST`/`SMTP_PORT` accordingly.

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/contacts | List / Create contacts |
| GET/PUT/DELETE | /api/contacts/:id | Get / Update / Delete contact |
| GET/POST | /api/leads | List / Create leads |
| GET/PUT/DELETE | /api/leads/:id | Get / Update / Delete lead |
| GET/POST | /api/deals | List / Create deals |
| GET/PUT/DELETE | /api/deals/:id | Get / Update / Delete deal |
| GET/POST | /api/tasks | List / Create tasks |
| PUT/DELETE | /api/tasks/:id | Update / Delete task |
| GET/POST | /api/invoices | List / Create invoices |
| GET/PUT/DELETE | /api/invoices/:id | Get / Update / Delete invoice |
| GET | /api/invoices/:id/pdf | Download invoice as PDF |
| POST | /api/invoices/:id/send-email | Email invoice PDF to contact |
| GET/POST | /api/activities | List / Create activity log entries |
| DELETE | /api/activities/:id | Delete activity log entry |
| GET | /api/dashboard/stats | Dashboard statistics |
| POST | /api/ai/chat | AI chat assistant |
| POST | /api/ai/generate-email | AI email draft generator |
| POST | /api/ai/score-lead/:id | AI lead scoring |
| POST | /api/ai/summarize-contact/:id | AI contact notes summary |

## Notes
- All CRM data (contacts/leads/deals/tasks) is scoped to the logged-in user (`owner` field).
- The AI model used is `gpt-4o-mini`; change `MODEL` in `backend/controllers/aiController.js` if you want a different model.
- For production, set strong `JWT_SECRET`, use HTTPS, and restrict `CLIENT_URL` CORS origin.

Enjoy building with your CRM! 🚀
