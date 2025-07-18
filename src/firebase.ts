// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChv2gThm8RdUrWHThzLnUOJ8lpv7rm7Ak",
  authDomain: "spansportshub1.firebaseapp.com",
  projectId: "spansportshub1",
  storageBucket: "spansportshub1.firebasestorage.app",
  messagingSenderId: "325214309688",
  appId: "1:325214309688:web:03e370db0fd828cc89c5cd",
  measurementId: "G-RXYCTD3X24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app); 