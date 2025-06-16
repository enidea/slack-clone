import { useEffect, useState } from "react";
import type { User } from "../../type/User";
import type { Message } from "../../type/Message";
import { getUser } from "../../features/user/UserApi";
import {
	updateMessage,
	deleteMessage,
} from "../../features/message/MessageApi";
import { useAppSelector } from "../../app/hooks";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface MessageTileProps {
	message: Message;
	messageId: string;
}

const MessageTile = ({ message, messageId }: MessageTileProps) => {
	const [owner, setUser] = useState<User | null>(null);
	const [showMenu, setShowMenu] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(message.text);
	const currentUserId = useAppSelector((state) => state.user.userId);

	const isOwner = currentUserId === message.user_id;

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const ownerData = await getUser(message.user_id);
				if (ownerData) {
					setUser(ownerData);
				}
			} catch (error) {
				setUser(null);
			}
		};
		fetchUser();
	}, [message.user_id]);

	useEffect(() => {
		const handleClickOutside = () => {
			if (showMenu) {
				setShowMenu(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [showMenu]);

	const handleEdit = () => {
		setIsEditing(true);
		setShowMenu(false);
	};

	const handleSaveEdit = async () => {
		if (editText.trim() && editText !== message.text) {
			try {
				await updateMessage(messageId, editText.trim());
				setIsEditing(false);
			} catch (error) {
				console.error("Failed to update message:", error);
			}
		} else {
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditText(message.text);
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (window.confirm("このメッセージを削除しますか？")) {
			try {
				await deleteMessage(messageId);
			} catch (error) {
				console.error("Failed to delete message:", error);
			}
		}
		setShowMenu(false);
	};

	return (
		<div className="bg-gray-700 p-3 m-3 rounded-lg relative group">
			<div className="flex items-center mb-2">
				<img
					src={owner?.profile_picture}
					alt="プロフィール画像"
					className="w-10 h-10 rounded-full mr-2"
				/>
				<div className="flex-1">
					<div className="text-sm font-semibold">
						{owner?.display_name || "unknown"}
						{message.is_edited && (
							<span className="text-xs text-gray-400 ml-2">(編集済み)</span>
						)}
					</div>
					<div className="text-xs text-gray-400">
						{message.created_at.toDate().toLocaleString() || ""}
					</div>
				</div>
				{isOwner && (
					<div className="relative">
						<button
							type="button"
							className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded"
							onClick={(e) => {
								e.stopPropagation();
								setShowMenu(!showMenu);
							}}
						>
							<MoreVertIcon className="text-gray-300" fontSize="small" />
						</button>
						{showMenu && (
							<div
								className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 min-w-16 whitespace-nowrap"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									type="button"
									className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-md"
									onClick={handleEdit}
								>
									編集
								</button>
								<button
									type="button"
									className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-md border-t border-gray-600"
									onClick={handleDelete}
								>
									削除
								</button>
							</div>
						)}
					</div>
				)}
			</div>
			{isEditing ? (
				<div className="space-y-2">
					<textarea
						value={editText}
						onChange={(e) => setEditText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
								handleSaveEdit();
							} else if (e.key === "Escape") {
								handleCancelEdit();
							}
						}}
						className="w-full bg-gray-600 text-white p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={3}
					/>
					<div className="flex gap-2">
						<button
							type="button"
							className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
							onClick={handleSaveEdit}
						>
							保存
						</button>
						<button
							type="button"
							className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
							onClick={handleCancelEdit}
						>
							キャンセル
						</button>
					</div>
					<p className="text-xs text-gray-400">
						Cmd+Enter で保存、Escape でキャンセル
					</p>
				</div>
			) : (
				<p className="text-gray-300">{message.text}</p>
			)}
		</div>
	);
};

export default MessageTile;
