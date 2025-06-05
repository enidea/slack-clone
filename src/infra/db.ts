import { type Firestore, getFirestore } from "firebase/firestore";
import { firebaseApp } from "../../firebase/firebaseConfig";

const db: Firestore = getFirestore(firebaseApp);

export default db;
