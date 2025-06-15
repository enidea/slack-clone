import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../../infra/db";
import type { User, UserRef } from "../../type/User";

export const getUser = async (user_uid: string): Promise<User | undefined> => {
	const user = doc(db, "users", user_uid);
	const docSnap = await getDoc(user);
	if (docSnap.exists()) {
		const docData = docSnap.data();

		return {
			profile_picture:
				docData.profile_picture === "none"
					? "default-user-icon.jpeg"
					: docData.profile_picture,
			email: docData.email,
			display_name: docData.display_name,
		};
	}
};
export const postUser = async (userRef: UserRef) => {
	const user = userRef.user;
	await setDoc(doc(db, "users", userRef.uid), {
		display_name: user.display_name,
		email: user.email,
		profile_picture: user.profile_picture,
	});
};
