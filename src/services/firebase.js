import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpg1lVeQoWwrNZs71yqaGAQDtmm6c4uLI",
  authDomain: "relaya-f7ba4.firebaseapp.com",
  projectId: "relaya-f7ba4",
  storageBucket: "relaya-f7ba4.firebasestorage.app",
  messagingSenderId: "488610187435",
  appId: "1:488610187435:web:b2fad188c5c14dc5c90fee",
  measurementId: "G-G212YDK400"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
