import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBp3zEKwBU3XWHejoA8_TJGwFtdY3ZFy8M",
  authDomain: "ptem-loader-mods.firebaseapp.com",
  projectId: "ptem-loader-mods",
  storageBucket: "ptem-loader-mods.firebasestorage.app",
  messagingSenderId: "580750878526",
  appId: "1:580750878526:web:6ff0be21b3466c5ca9ee6f"
};

export const auth = getAuth(app);
