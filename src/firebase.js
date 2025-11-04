// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA31eWb6Ibloz1fQN-tVZdpaihzkP4tfbY",
  authDomain: "digital-e6840.firebaseapp.com",
  projectId: "digital-e6840",
  storageBucket: "digital-e6840.firebasestorage.app",
  messagingSenderId: "267574972163",
  appId: "1:267574972163:web:ccf3ed48c4eae78b35e336",
  measurementId: "G-JPD49CF8ZR"
};

let analyticsInstance = null;

export async function initAnalytics() {
  const app = initializeApp(firebaseConfig);
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
    console.log("✅ Firebase Analytics activé");
  } else {
    console.warn("❌ Firebase Analytics non supporté sur ce navigateur");
  }
}

export function getAnalyticsInstance() {
  return analyticsInstance;
}
