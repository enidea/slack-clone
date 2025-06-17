import {
	type ChangeEvent,
	type KeyboardEvent,
	useEffect,
	useState,
} from "react";
import { TextareaAutosize } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import type { MessageRef } from "../../type/Message";
import { useAppSelector } from "../../app/hooks";
import {
	createMessage,
	subscribeMessages,
	postMessage,
} from "../../features/message/MessageApi";
import MessageTile from "./MessageTile";

const MessageArea = () => {
	const [messageRefs, setMessageRefs] = useState<MessageRef[]>([]);
	const userId = useAppSelector((state) => state.user.userId);
	const channelId: string = useAppSelector(
		(state) => state.channel.currentChannelId,
	);

	const [message, setMessage] = useState("");
	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);
	};

	const sendMessage = async () => {
		if (userId) {
			try {
				await postMessage(createMessage(userId, channelId, message));
				setMessage("");
			} catch (e) {
				console.error("Error sending message: ", e);
			}
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.metaKey || e.ctrlKey) && e.code === "Enter") {
			sendMessage();
		}
	};

	useEffect(() => {
		if (channelId) {
			const unsubscripbe = subscribeMessages(channelId, (messageRefs) => {
				setMessageRefs(messageRefs);
			});
			return () => unsubscripbe();
		}

		setMessageRefs([]);
	}, [channelId]);
	return (
		<div className="flex-1 flex flex-col bg-gray-500 text-white">
			{channelId ? (
				<>
					<div className="p-4 m-3 overflow-y-auto">
						{messageRefs.map((messageRef) => (
							<MessageTile
								message={messageRef.message}
								messageId={messageRef.id}
								key={messageRef.id}
							/>
						))}
					</div>

					<div className="mt-auto px-4 py-2 bottom-0 bg-gray-900">
						<div className="flex items-center">
							<TextareaAutosize
								placeholder="メッセージを入力"
								className="flex-1 bg-gray-700 text-white p-2 mx-2 rounded-lg focus:outline-none"
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								value={message}
							/>
							<button
								type="button"
								className="text-gray-400 hover:text-white"
								onClick={sendMessage}
							>
								<SendIcon />
							</button>
						</div>
					</div>
				</>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center text-gray-300">
						<div className="text-xl mb-2">チャンネルを選択してください</div>
						<div className="text-sm">
							左のサイドバーからチャンネルを選択するか、新しいチャンネルを作成してください。
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MessageArea;
