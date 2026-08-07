const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCR-ytX5M0UHoNUUeN9K-NQXPsSeARyWgw",
  authDomain: "mess-managment-b6ac8.firebaseapp.com",
  projectId: "mess-managment-b6ac8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addWarden() {
  const email = "warden@college.edu";
  // We can just use the email as the document ID for simplicity, or generate a random one.
  const docRef = doc(db, "users", "admin_" + Date.now());
  
  await setDoc(docRef, {
    uid: docRef.id,
    email: email,
    role: "authority",
    name: "Chief Warden",
    createdAt: new Date().toISOString()
  });
  
  console.log("Warden added successfully!");
}

addWarden().catch(console.error);
