import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectWorkspace } from "../features/workspace/WorkspaceSlice";
import { joinWorkspaceByInviteCode } from "../features/workspace/WorkspaceApi";
import LinkIcon from "@mui/icons-material/Link";

interface WorkspaceJoinModalProps {
	onClose: () => void;
}

const WorkspaceJoinModal = ({ onClose }: WorkspaceJoinModalProps) => {
	const [inviteCode, setInviteCode] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const [error, setError] = useState("");

	const dispatch = useAppDispatch();
	const userId = useAppSelector((state) => state.user.userId);

	const handleJoinWorkspace = async () => {
		if (!inviteCode.trim() || !userId || isJoining) return;

		setIsJoining(true);
		setError("");

		try {
			const workspaceId = await joinWorkspaceByInviteCode(
				userId,
				inviteCode.trim(),
			);

			// 参加したワークスペースの情報を取得して選択状態にする
			const { getWorkspace } = await import(
				"../features/workspace/WorkspaceApi"
			);
			const workspace = await getWorkspace(workspaceId);

			if (workspace) {
				dispatch(
					selectWorkspace({
						id: workspaceId,
						name: workspace.name,
					}),
				);
			}

			onClose();
		} catch (error) {
			console.error("Failed to join workspace:", error);
			setError(
				error instanceof Error
					? error.message
					: "ワークスペースへの参加に失敗しました",
			);
		} finally {
			setIsJoining(false);
		}
	};

	const handleClose = () => {
		setInviteCode("");
		setError("");
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
				<div className="p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						<LinkIcon />
						ワークスペースに参加
					</h3>

					<div className="space-y-4">
						<div>
							<label
								htmlFor="inviteCode"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								招待コード
							</label>
							<input
								id="inviteCode"
								type="text"
								value={inviteCode}
								onChange={(e) => setInviteCode(e.target.value)}
								className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
								placeholder="招待コードを入力してください"
								maxLength={50}
							/>
							<p className="text-xs text-gray-500 mt-1">
								ワークスペースの管理者から招待コードを教えてもらってください
							</p>
						</div>

						{error && (
							<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
								{error}
							</div>
						)}
					</div>

					<div className="flex gap-3 mt-6">
						<button
							type="button"
							className="flex-1 p-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
							onClick={handleClose}
							disabled={isJoining}
						>
							キャンセル
						</button>
						<button
							type="button"
							className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleJoinWorkspace}
							disabled={!inviteCode.trim() || isJoining}
						>
							{isJoining ? "参加中..." : "参加"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WorkspaceJoinModal;
