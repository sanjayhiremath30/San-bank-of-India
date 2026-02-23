# AI Digital Banking (SAN BANK)

A perfectly runnable, full-stack AI-driven digital banking platform.

## Features
- **Backend (Next.js)**: ACID transactions, Prisma ORM, Double-entry ledger.
- **Security**: NextAuth.js JWT, Refresh Tokens, Brcypt hashing.
- **AI**: Fraud detection engine with heuristic-based risk scoring.
- **Dashboard**: Premium, responsive web dashboard for administration and users.
- **Mobile (Expo)**: Professional React Native app with biometrics and secure storage.

## Project Structure
- `/backend`: Next.js web application and API.
- `/mobile`: Expo mobile application.

## Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` with your PostgreSQL `DATABASE_URL`.
4. Run `npx prisma generate`.
5. Run `npm run dev`.

### Mobile
1. `cd mobile`
2. `npm install`
3. Run `npx expo start`.

## Deployment
This project is configured for **Vercel**. Point your Vercel project to the `backend` folder or use the root `vercel.json`.
