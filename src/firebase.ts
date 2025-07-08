import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// (Optional) import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAabCGZ1nos3gjKNsI70YzWfvqVpGanZtU",
  authDomain: "spansportshub.firebaseapp.com",
  projectId: "spansportshub",
  storageBucket: "spansportshub.appspot.com", // <-- FIXED THIS LINE
  messagingSenderId: "310599080950",
  appId: "1:310599080950:web:3effa5ca71a286c48705d7",
  measurementId: "G-6ZKFEBBEQE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// (Optional) export const analytics = getAnalytics(app); 