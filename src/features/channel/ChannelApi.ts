import {
	collection,
	getFirestore,
	onSnapshot,
	query,
} from "firebase/firestore";
import { firebaseApp } from "../../../firebase/firebaseConfig";
import type { Channel, ChannelRef } from "../../type/Channel";

const db = getFirestore(firebaseApp);

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
