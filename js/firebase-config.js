// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDS6U6J6M-onomq5SS0c-Vyd-EG529Ghn0",
  authDomain: "m2store-b682e.firebaseapp.com",
  projectId: "m2store-b682e",
  storageBucket: "m2store-b682e.firebasestorage.app",
  messagingSenderId: "980857359138",
  appId: "1:980857359138:web:1092b1a946f044f6ca337b",
  databaseURL: `https://${projectId}.firebaseio.com`
};

// Initialize Firebase with error handling
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const rtdb = firebase.database(); // Initialize Realtime Database
  window.db = db;
  window.rtdb = rtdb;
  console.log('Firebase initialized successfully');

  // Enable offline persistence
  db.enablePersistence()
    .then(() => {
      console.log('Offline persistence enabled');
    })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      }
    });
} catch (error) {
  console.error('Firebase initialization error:', error);
}