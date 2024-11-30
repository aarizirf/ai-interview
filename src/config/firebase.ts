import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCLKllGdT2vBIIYr5tkfzv0qr_hK1G88es",
  authDomain: "ai-interview-9d3b3.firebaseapp.com",
  projectId: "ai-interview-9d3b3",
  storageBucket: "ai-interview-9d3b3.firebasestorage.app",
  messagingSenderId: "1070406333098",
  appId: "1:1070406333098:web:01772d809dc1479ea456d3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 