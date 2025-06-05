import { doc, getDoc } from "firebase/firestore";
import db from "../../infra/db";
import type { User } from "../../type/User";

export const getUser = async (user_uid: string) => {
	const usersRef = doc(db, "users", user_uid);
	const docSnap = await getDoc(usersRef);
	if (docSnap.exists()) {
		return docSnap.data() as User;
	}
};
