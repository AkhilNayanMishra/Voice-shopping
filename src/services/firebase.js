import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";


const firebaseConfig = { 
    apiKey: "REPLACE_ME", 
    authDomain: "REPLACE_ME", 
    projectId: "REPLACE_ME", 
    storageBucket: "REPLACE_ME", 
    messagingSenderId: "REPLACE_ME", 
    appId: "REPLACE_ME" 
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) { 
  console.warn("Firebase not initialized. App will run in offline mode."); 
}

export { 
    db, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    query, 
    orderBy, 
    updateDoc 
};