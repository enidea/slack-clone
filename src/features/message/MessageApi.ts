import {
	Timestamp,
	addDoc,
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	updateDoc,
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
			messageRefs.sort(
				(a, b) =>
					b.message.created_at.toMillis() - a.message.created_at.toMillis(),
			);
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

export const updateMessage = async (messageId: string, newText: string) => {
	const messageRef = doc(db, "messages", messageId);
	await updateDoc(messageRef, {
		text: newText,
		is_edited: true,
		updated_at: Timestamp.fromDate(new Date()),
	});
};

export const deleteMessage = async (messageId: string) => {
	const messageRef = doc(db, "messages", messageId);
	await deleteDoc(messageRef);
};
