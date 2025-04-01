import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBpmPY2ZGpNqEwDNEZHWD43Zx7KNnM5LzQ",
    authDomain: "chatapp-b6662.firebaseapp.com",
    projectId: "chatapp-b6662",
    storageBucket: "chatapp-b6662.appspot.com", // fixed storage bucket URL
    messagingSenderId: "811257851419",
    appId: "1:811257851419:web:2e37323f02966fa68a92be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
