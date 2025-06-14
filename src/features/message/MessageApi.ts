import {
	Timestamp,
	addDoc,
	collection,
	onSnapshot,
	query,
	where,
} from "firebase/firestore";
import db from "../../infra/db";
import type { Message, MessageRef } from "../../type/Message";

export const subscribeMessages = (
	channelID: string,
	onMessagesUpdated: (messages: MessageRef[]) => void,
) => {
	const q = query(
		collection(db, "messages"),
		where("channel_id", "==", channelID),
	);

	return onSnapshot(
		q,
		(querySnapshot) => {
			const messageRefs: MessageRef[] = [];
			for (const doc of querySnapshot.docs) {
				messageRefs.push({
					id: doc.id,
					message: doc.data() as Message,
				});
			}
			onMessagesUpdated(messageRefs);
		},
		(error) => {
			console.error("Failed to subscribe messages:", error);
		},
	);
};

export const postMessage = async (message: Message) => {
	await addDoc(collection(db, "messages"), message);
};

export const createMessage = (
	userId: string,
	channelId: string,
	messageText: string,
): Message => {
	const timestamp = Timestamp.fromDate(new Date());
	return {
		user_id: userId,
		channel_id: channelId,
		text: messageText,
		created_at: timestamp,
		is_edited: false,
		updated_at: timestamp,
	};
};
