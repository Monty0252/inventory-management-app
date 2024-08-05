// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxOkU7uR5plecTKsVpLKOiGlZSN0X1mrs",
  authDomain: "inventory-tracker-5b6a2.firebaseapp.com",
  projectId: "inventory-tracker-5b6a2",
  storageBucket: "inventory-tracker-5b6a2.appspot.com",
  messagingSenderId: "934445071270",
  appId: "1:934445071270:web:3c30493ddabbfa5966ed67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };
