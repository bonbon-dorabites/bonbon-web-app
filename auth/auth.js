// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyB2ACxlgsaO0_E2zA1zsPEntCXOIHaG21I",
authDomain: "bonbon-8a34a.firebaseapp.com",
projectId: "bonbon-8a34a",
storageBucket: "bonbon-8a34a.firebasestorage.app",
messagingSenderId: "276254510771",
appId: "1:276254510771:web:b936bce5f45ed255b56ac6",
measurementId: "G-85BQTNL30R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'en';