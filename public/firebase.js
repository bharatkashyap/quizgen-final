import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection as firestoreCollection,
  query as firestoreQuery,
  where as firestoreWhere,
  getDoc as firebaseGetDoc,
  getDocs as firebaseGetDocs,
  doc as firebaseDoc,
  setDoc as firebaseSetDoc,
  serverTimestamp as firebaseServerTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0db68DhXLKxtPCyzmjeL3zcWbIllrPU8",
  authDomain: "quizgen.app",
  databaseURL: "https://quizgen-final.firebaseio.com",
  projectId: "quizgen-final",
  storageBucket: "quizgen-final.appspot.com",
  messagingSenderId: "789815253960",
  appId: "1:789815253960:web:8d49a9968c5e7037a47efd",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.metadata.readonly");
provider.addScope("https://www.googleapis.com/auth/spreadsheets.readonly");

export const GoogleProvider = GoogleAuthProvider;
export const auth = getAuth();
export const signIn = signInWithPopup;
export const googleAuthProvider = provider;
export const setDoc = firebaseSetDoc;
export const doc = firebaseDoc;
export const getDoc = firebaseGetDoc;
export const getDocs = firebaseGetDocs;
export const serverTimestamp = firebaseServerTimestamp;
export const query = firestoreQuery;
export const collection = firestoreCollection;
export const where = firestoreWhere;
export const db = getFirestore(app);
