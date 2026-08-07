const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCR-ytX5M0UHoNUUeN9K-NQXPsSeARyWgw",
  authDomain: "mess-managment-b6ac8.firebaseapp.com",
  projectId: "mess-managment-b6ac8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.role === 'authority' || data.role === 'warden' || data.role === 'manager') {
      console.log(doc.id, " => ", data);
    }
  });
}

checkUsers();
