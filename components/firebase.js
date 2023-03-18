import { initializeApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore/lite';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAuClebwKo-CU734y_TvVvaWzzs2HZKQwA",
    authDomain: "reactnative-mandatory1.firebaseapp.com",
    projectId: "reactnative-mandatory1",
    storageBucket: "reactnative-mandatory1.appspot.com",
    messagingSenderId: "737704601694",
    appId: "1:737704601694:web:e38692a2de700bb3432ccf"
};

/**
 * if import is like → import firebase from '../path/firebaseDb';
 * it's uses default export Configeration. → ex. import firebase from '../path/firebaseDb';
 * 
 * Other Options is following:
 * 1. import { db } from '../path/firebaseDb';
 * 2. import { auth } from '../path/firebaseDb';
 * 3. import { storage } from '../path/firebaseDb';
 */
const firebaseApp = initializeApp(firebaseConfig);

/**
 * Export Firebase DB. → ex. import { db } from '../path/firebaseDb';
 * 
 * * Then it can just be used like collection(db, 'notes');
 */
export const db = getFirestore(firebaseApp);

/**
 * Export Authentication. → ex. import { auth } from '../path/firebaseDb';
 */
export const auth = getAuth();

/**
 * Export Firebase storage. → ex. import { storage } from '../path/firebaseDb';
 */
export const storage = getStorage(firebaseApp);

/**
 * Default export Configeration. → ex. import firebase from '../path/firebaseDb';
 */
export default firebaseApp;