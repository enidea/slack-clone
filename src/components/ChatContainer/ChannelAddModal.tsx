import { type ChangeEvent, useState } from "react";
import { createChannel, postChannel } from "../../features/channel/ChannelApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectChannel } from "../../features/channel/ChannelSlice";

type Props = { handleCloseModal: () => void };

export const ChannelAddModal = ({ handleCloseModal }: Props) => {
	const dispatch = useAppDispatch();
	const [channelName, setChannelName] = useState("");
	const currentWorkspaceId = useAppSelector(
		(state) => state.workspace.currentWorkspaceId,
	);

	const handleChannelNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		setChannelName(e.target.value);
	};

	const handleAddChannel = async () => {
		if (!channelName.trim() || !currentWorkspaceId) return;

		try {
			const newChannel = await postChannel(
				createChannel(channelName, currentWorkspaceId),
			);
			setChannelName("");
			handleCloseModal();
			dispatch(selectChannel(newChannel.id));
		} catch (e) {
			console.error("Error adding document: ", e);
		}
	};

	const handleModalClick = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
	) => {
		e.stopPropagation();
	};

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white"
			onClick={handleCloseModal}
		>
			<div
				className="bg-gray-700 rounded-lg shadow-xl w-1/2"
				onClick={handleModalClick}
			>
				<div className="border-b px-4 py-2 flex justify-between items-center">
					<h3 className="font-semibold text-lg">チャンネルを作成する</h3>
					<button
						type="button"
						className="close-modal"
						onClick={handleCloseModal}
					>
						&times;
					</button>
				</div>
				<div className="p-4">
					<input
						type="text"
						className="border rounded w-full py-2 px-3 text-grey-darkest"
						placeholder="名前"
						onChange={handleChannelNameChange}
					/>
					<p className="text-sm text-grey mt-4">
						チャンネルは、特定のトピックに関する会話が行われる場所です。見つけやすく、わかりやすい名前を使用してください。
					</p>
				</div>
				<div className="flex justify-end items-center border-t p-4">
					<button
						type="button"
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						onClick={handleAddChannel}
					>
						作成
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChannelAddModal;
