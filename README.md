# Nexus Publish Server

## Setup Instructions

### Environment Variables
1. Copy `.env.example` to `.env`
2. Update the variables in `.env` with your values

### Firebase Setup
1. Create a new Firebase project
2. Generate a new Service Account Key from Firebase Console
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
3. Save the downloaded JSON file as `firebase-credentials.json` in `src/config/`
4. Update FIREBASE_SERVICE_ACCOUNT_KEY_PATH in `.env` to point to this file

### Database Setup
1. Make sure MySQL is running
2. Create database as specified in DATABASE_URL
3. Run migrations: `npm run prisma:migrate`

### Running the Server
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
