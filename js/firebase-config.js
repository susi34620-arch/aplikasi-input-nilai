// Import fungsi yang Anda butuhkan
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// ▼▼▼ INI ADALAH KODE ANDA YANG TADI ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyCagajibp...",
  authDomain: "aplikasi-input-nilai-7ade4.firebaseapp.com",
  projectId: "aplikasi-input-nilai-7ade4",
  storageBucket: "aplikasi-input-nilai-7ade4.appspot.com",
  messagingSenderId: "382859984253",
  appId: "1:382859984253:web:782157143276a29e2a814",
  measurementId: "G-55Y57MYTD4"
};
// ▲▲▲ BATAS KODE ANDA ▲▲▲

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor database agar bisa digunakan oleh file 'logic.js'
export const db = getFirestore(app);
