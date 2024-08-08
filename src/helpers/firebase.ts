import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage'

// temperary usage for image upload to be remove once azure storage works
const firebaseConfig = {
  apiKey: "AIzaSyAa2eOjT-TQ-ZbCOAwkdcJk6kbiwBp1JX0",
  authDomain: "jambapp-3e437.firebaseapp.com",
  projectId: "jambapp-3e437",
  storageBucket: "jambapp-3e437.appspot.com",
  messagingSenderId: "783915475027",
  appId: "1:783915475027:web:a1d374916f1efd21e526a6",
  measurementId: "G-X2B42G8SBJ"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app)

export default storage


