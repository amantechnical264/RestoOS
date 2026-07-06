import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxC5VGpfi-bkluyk5YVSzSPBb9TcK8-As",
  authDomain: "restroos-76177.firebaseapp.com",
  projectId: "restroos-76177",
  storageBucket: "restroos-76177.firebasestorage.app",
  messagingSenderId: "550018057520",
  appId: "1:550018057520:web:547b00b70baa6a4d4eb4f5",
  measurementId: "G-YQ2Q0LTWV9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
