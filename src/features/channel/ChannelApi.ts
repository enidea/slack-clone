import {
	Timestamp,
	addDoc,
	collection,
	onSnapshot,
	query,
} from "firebase/firestore";
import db from "../../infra/db";
import type { Channel, ChannelRef } from "../../type/Channel";

export const subscribeChannels = (
	onChannelsUpdated: (channels: ChannelRef[]) => void,
) => {
	const q = query(collection(db, "channels"));

	return onSnapshot(
		q,
		(querySnapshot) => {
			const channelRefs: ChannelRef[] = [];
			for (const doc of querySnapshot.docs) {
				channelRefs.push({
					id: doc.id,
					channel: doc.data() as Channel,
				});
			}
			onChannelsUpdated(channelRefs);
		},
		(error) => {
			console.error("Failed to subscribe channels:", error);
		},
	);
};
export const postChannel = async (channel: Channel) => {
	await addDoc(collection(db, "channels"), channel);
};

export const createChannel = (name: string): Channel => {
	const timestamp = Timestamp.fromDate(new Date());
	return {
		name: name,
		create_at: timestamp,
	};
};
