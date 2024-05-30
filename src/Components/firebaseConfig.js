// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBpl62VOwT6totZxn3LPHrnt4JhG3xjWdI",
  authDomain: "unextra-prod.firebaseapp.com",
  databaseURL:
    "https://unextra-prod-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "unextra-prod",
  storageBucket: "unextra-prod.appspot.com",
  messagingSenderId: "705321915257",
  appId: "1:705321915257:web:dfa27120f912c0a40e15a8",
  measurementId: "G-9L9NKZV52Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export { database };
