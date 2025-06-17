import type { Timestamp } from "firebase/firestore";

export interface Channel {
	name: string;
	workspace_id: string;
	create_at: Timestamp;
}

export interface ChannelRef {
	id: string;
	channel: Channel;
}
