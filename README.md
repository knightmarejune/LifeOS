# LifeOS

A personal productivity dashboard with Tasks, Habits, Focus Timer, and Journaling. Integrated with Google Authentication and MongoDB.

## Features
- **Google Authentication**: Secure login via Firebase.
- **Tasks**: Priority-based task management.
- **Habits**: Daily habit tracking with streak calculation.
- **Journal**: Daily reflections with mood tracking.
- **Focus Timer**: Deep work timer.
- **Analytics**: Visual insights into your productivity.

## Project Structure
- `client/`: React + Vite + Tailwind CSS + Zustand.
- `server/`: Express + Mongoose + Firebase Admin SDK.

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Firebase Project

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd LifeOS
   ```

2. **Server Setup**
   - Navigate to the `server` directory:
     ```bash
     cd server
     npm install
     ```
   - Create a `.env` file based on `.env.example`:
     ```bash
     cp .env.example .env
     ```
   - Add your `MONGODB_URI` to `.env`.
   - Download your **Firebase Service Account JSON** from the Firebase Console and save it as `server/firebase-service-account.json`.

3. **Client Setup**
   - Navigate to the `client` directory:
     ```bash
     cd ../client
     npm install
     ```
   - The Firebase configuration is currently hardcoded in `client/src/lib/firebase.ts`. (Optional: Move to `.env` if desired).

4. **Run the application**
   - Start the backend:
     ```bash
     cd ../server
     npm run dev
     ```
   - Start the frontend:
     ```bash
     cd ../client
     npm run dev
     ```

## Deployment
- The app is ready for deployment on platforms like Vercel (frontend) and Render/Heroku (backend).
- Ensure environment variables and service accounts are configured in your deployment settings.

## License
MIT
