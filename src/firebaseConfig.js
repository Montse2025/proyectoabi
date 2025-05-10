import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKeMiclmXqlh7dHOijpZt7M48t4Rlzd5w",
  authDomain: "proyectoabi-de5dc.firebaseapp.com",
  projectId: "proyectoabi-de5dc",
  storageBucket: "proyectoabi-de5dc.firebasestorage.app",
  messagingSenderId: "288857024274",
  appId: "1:288857024274:web:b12005785c6fcc0f4af5cb",
  measurementId: "G-HDLSZQNLLB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Inicializa la autenticación y la exporta

export { db, auth }; // Ahora puedes exportar ambas
