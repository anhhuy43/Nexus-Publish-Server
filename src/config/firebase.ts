import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
  ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
  : undefined;

async function initializeFirebase() {
  if (!serviceAccountPath) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH is not set in .env');
    process.exit(1);
  }

  try {
    const serviceAccountContent = await fs.readFile(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountContent);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    process.exit(1);
  }
}

initializeFirebase();

export default admin;
