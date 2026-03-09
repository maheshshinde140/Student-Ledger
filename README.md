# Student Table - Full Stack

Beautiful Next.js frontend + NestJS/MongoDB backend for managing students.

## Structure
- `frontend` Next.js (App Router)
- `backend` NestJS + Mongoose + MongoDB

## Local Setup

### Backend
1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
2. Install and run:
```bash
cd backend
npm install
npm run start:dev
```

Backend runs on `http://localhost:4000`.

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_BASE_URL`.
2. Install and run:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Tests
```bash
cd backend
npm run test
```

## Deployment

### Backend on Render
1. Create a new Web Service from this repo.
2. Set Root Directory to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start:prod`
5. Add env vars:
   - `NODE_ENV=production`
   - `MONGODB_URI` from MongoDB Atlas
   - `CORS_ORIGIN` = your Vercel frontend URL

### Frontend on Vercel
1. Import the repo and set Root Directory to `frontend`.
2. Add env var:
   - `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL
3. Deploy.

## Features
- CRUD for students with validation
- Search and Excel export
- Loading states and confirmation dialogs
- Secure backend with CORS, Helmet, and rate limiting
