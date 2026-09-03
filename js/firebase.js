import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVncgVZCzOPHWPFRbIBYACTcOAUImKqmM",
  authDomain: "parking-108d1.firebaseapp.com",
  projectId: "parking-108d1",
  storageBucket: "parking-108d1.firebasestorage.app",
  messagingSenderId: "237479413570",
  appId: "1:237479413570:web:6806405b54bd3218feeadb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Export the services so other files can use them
export { auth, db };

