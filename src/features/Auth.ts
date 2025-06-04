import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { firebaseApp } from "../../firebase/firebaseConfig";

export const auth = getAuth(firebaseApp);

export const signInWithGoogle = () => {
	const provider = new GoogleAuthProvider();
	return signInWithPopup(auth, provider);
};

export const signOut = () => {
	return auth.signOut();
};
