// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDPnete2roALchSvlYToy1uOfDtkzkeeQ",
  authDomain: "macwater-caa60.firebaseapp.com",
  projectId: "macwater-caa60",
  storageBucket: "macwater-caa60.appspot.com",
  messagingSenderId: "25707123925",
  appId: "1:25707123925:web:f84ef5cb029f6a3366fe5c",
  measurementId: "G-CXBJXNHBZS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();