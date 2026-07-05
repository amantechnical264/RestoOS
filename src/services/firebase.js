import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDz4cuRjv-4XcMDDGKfzCjIuUbuU5g2FS0",
  authDomain: "restroos-bb895.firebaseapp.com",
  projectId: "restroos-bb895",
  storageBucket: "restroos-bb895.firebasestorage.app",
  messagingSenderId: "1006761126053",
  appId: "1:1006761126053:web:90ed852984e92db3b5c54c",
  measurementId: "G-Y51YKK3XMY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
