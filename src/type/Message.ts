import type { Timestamp } from "firebase/firestore";

export interface Message {
	user_id: string;
	channel_id: string;
	text: string;
	created_at: Timestamp;
	is_edited: boolean;
	updated_at: Timestamp;
}

export interface MessageRef {
	id: string;
	message: Message;
}
