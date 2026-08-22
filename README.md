# GlobeTrotter - Multi-City Travel Planner & AI Itinerary Generator

GlobeTrotter is a full-stack multi-city travel planning platform with interactive route scheduling, live budgeting, destination discovery, and AI-powered trip generation powered by Google Gemini.

## Features

- **Express + TypeScript Backend**: RESTful API architecture with persistent JSON database storage (`server/data/db.json`) and atomic transactions.
- **AI Itinerary Generator**: Automated day-by-day trip generation with Google Gemini (`@google/genai`) and intelligent offline heuristics.
- **Trip & Itinerary Management**: Create multi-stop journeys, schedule activities, reorder stops/activities, track budgets, and share itineraries publicly.
- **Destination & Activity Catalog**: Filterable catalog of cities, weather, attractions, and curated experiences.
- **Real-Time Admin Analytics**: Live platform stats on journeys, total budgets, and popular destinations.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional for Gemini AI)
Copy `.env.example` to `.env.local` and add your Gemini API key:
```bash
cp .env.example .env.local
```
Inside `.env.local`:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3001
```

### 3. Run Locally
To run both the **Backend Express API** (port 3001) and **Frontend Vite App** (port 3000) concurrently:
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Server (Port 3001)
npm run server

# Terminal 2: Frontend Vite App (Port 3000)
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and database health status |
| `POST` | `/api/auth/login` | Sign in or auto-provision traveler account |
| `POST` | `/api/auth/register` | Register new account |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/users/profile` | Update profile preferences |
| `POST` | `/api/users/save-destination` | Toggle saved/bookmarked city |
| `GET` | `/api/trips` | List all user / discoverable trips |
| `GET` | `/api/trips/:id` | Fetch detailed trip with stops & activities |
| `POST` | `/api/trips` | Create a new trip itinerary |
| `PUT` | `/api/trips/:id` | Update trip details & budget targets |
| `DELETE` | `/api/trips/:id` | Delete trip |
| `POST` | `/api/trips/:id/duplicate` | Clone trip itinerary |
| `POST` | `/api/trips/:id/stops` | Add destination stop |
| `DELETE` | `/api/trips/:id/stops/:stopId` | Remove destination stop |
| `PATCH` | `/api/trips/:id/stops/reorder` | Reorder destination stops |
| `POST` | `/api/trips/:id/stops/:stopId/activities` | Add activity to stop |
| `DELETE` | `/api/trips/:id/stops/:stopId/activities/:activityId` | Remove activity |
| `PATCH` | `/api/trips/:id/stops/:stopId/activities/reorder` | Reorder activities |
| `GET` | `/api/cities` | Search and filter destinations |
| `GET` | `/api/activities` | Search and filter catalog activities |
| `POST` | `/api/ai/generate-itinerary` | Generate complete multi-stop trip with Gemini AI |
| `POST` | `/api/ai/suggest-activities` | AI curated activity recommendations |
| `POST` | `/api/ai/travel-copilot` | Travel concierge Q&A and packing advice |
| `GET` | `/api/admin/stats` | Aggregated platform metrics and distribution |
| `POST` | `/api/admin/reset` | Reset database to initial sample dataset |
