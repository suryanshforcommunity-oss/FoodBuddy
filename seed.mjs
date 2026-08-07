import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR-ytX5M0UHoNUUeN9K-NQXPsSeARyWgw",
  authDomain: "mess-managment-b6ac8.firebaseapp.com",
  projectId: "mess-managment-b6ac8",
  storageBucket: "mess-managment-b6ac8.firebasestorage.app",
  messagingSenderId: "870389302004",
  appId: "1:870389302004:web:893d8b55e4d545391f14a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const demoAccounts = [
  { email: "student@demo.com", password: "password123", name: "Demo Student", roll_no: "2024DEMO", year: "1", role: "student" },
  { email: "manager@demo.com", password: "password123", name: "Demo Manager", roll_no: "MGR001", year: "N/A", role: "manager" },
  { email: "warden@demo.com", password: "password123", name: "Demo Warden", roll_no: "WRD001", year: "N/A", role: "authority" }
];

async function seed() {
  for (const acc of demoAccounts) {
    try {
      console.log(`Processing ${acc.email}...`);
      let uid;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
        uid = userCred.user.uid;
        console.log(`Created auth for ${acc.email}`);
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          console.log(`Auth exists for ${acc.email}. Signing in to get UID...`);
          const userCred = await signInWithEmailAndPassword(auth, acc.email, acc.password);
          uid = userCred.user.uid;
        } else {
          throw err;
        }
      }
      
      console.log(`Writing Firestore document for ${acc.email} (UID: ${uid})...`);
      await setDoc(doc(db, "users", uid), {
        uid: uid,
        name: acc.name,
        email: acc.email,
        roll_no: acc.roll_no,
        year: acc.year,
        role: acc.role,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Completely set up ${acc.email}.`);
    } catch (err) {
      console.error(`❌ Error processing ${acc.email}:`, err.message);
    }
  }
  process.exit();
}

seed();
