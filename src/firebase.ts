import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAISP8KyovJOneEoRUb7Yq6uPH8ZbYBQQ0",
  authDomain: "your-music-buddy.firebaseapp.com",
  projectId: "your-music-buddy",
  storageBucket: "your-music-buddy.appspot.com",
  messagingSenderId: "826298110919",
  appId: "1:826298110919:web:f3fbec0337a450ff19bfe2",
  measurementId: "G-T64GR6E703",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
