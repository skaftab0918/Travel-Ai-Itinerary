# Trrip — AI Travel Itinerary Generator

MERN stack app: upload travel documents (flight tickets, hotel bookings — PDF/image), Gemini AI extracts the data and generates a full day-by-day itinerary. JWT auth, dashboard, shareable public links.

## 1. Local Setup

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in .env: MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 2. Get a Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key" → copy it
3. Paste into `server/.env` as `GEMINI_API_KEY`

## 3. MongoDB Atlas (free)
1. https://www.mongodb.com/cloud/atlas/register → create free M0 cluster
2. Database Access → add a user with password
3. Network Access → Allow access from anywhere (0.0.0.0/0)
4. Get connection string → paste into `MONGO_URI` in `.env`, replace `<password>` and add `/trrip` as db name before the `?`

