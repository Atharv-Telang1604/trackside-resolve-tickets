
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDGWJrrwp7K3r9hNqByPZNnNgef0du2iZY',
  authDomain: 'railmadad-229be.firebaseapp.com',
  projectId: 'railmadad-229be',
  storageBucket: 'railmadad-229be.appspot.com',
  messagingSenderId: '931249311014',
  appId: '1:931249311014:web:b22b2c5d4ecb1234567890', // Replace this with your actual appId if available
  databaseURL: 'https://railmadad-229be-default-rtdb.firebaseio.com'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
