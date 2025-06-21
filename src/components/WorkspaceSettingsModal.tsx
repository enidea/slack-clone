import { useState, useEffect } from "react";
import { generateInviteCode } from "../features/workspace/WorkspaceApi";
import { useAppSelector } from "../app/hooks";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";

interface WorkspaceSettingsModalProps {
	onClose: () => void;
}

const WorkspaceSettingsModal = ({ onClose }: WorkspaceSettingsModalProps) => {
	const [inviteCode, setInviteCode] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");

	const currentWorkspaceId = useAppSelector(
		(state) => state.workspace.currentWorkspaceId,
	);

	const handleGenerateInviteCode = async () => {
		if (!currentWorkspaceId || isGenerating) return;

		setIsGenerating(true);
		setError("");

		try {
			const code = await generateInviteCode(currentWorkspaceId);
			setInviteCode(code);
		} catch (error) {
			console.error("Failed to generate invite code:", error);
			setError("招待コードの生成に失敗しました");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyInviteCode = async () => {
		if (!inviteCode) return;

		try {
			await navigator.clipboard.writeText(inviteCode);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy invite code:", error);
		}
	};

	const handleClose = () => {
		setInviteCode("");
		setError("");
		setCopied(false);
		onClose();
	};

	useEffect(() => {
		// モーダルが開かれたときに既存の招待コードを確認
		// 実装の簡単のため、今回は毎回新しいコードを生成
	}, []);

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
				<div className="p-6">
					<h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
						<SettingsIcon />
						ワークスペース設定
					</h3>

					<div className="space-y-4">
						<div>
							<h4 className="text-lg font-semibold text-gray-700 mb-3">
								メンバー招待
							</h4>

							{!inviteCode ? (
								<div className="text-center">
									<p className="text-gray-600 mb-4">
										新しいメンバーを招待するための招待コードを生成します
									</p>
									<button
										type="button"
										className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
										onClick={handleGenerateInviteCode}
										disabled={isGenerating}
									>
										{isGenerating ? "生成中..." : "招待コードを生成"}
									</button>
								</div>
							) : (
								<div>
									<p className="text-sm text-gray-600 mb-2">
										この招待コードを新しいメンバーに共有してください（7日間有効）
									</p>
									<div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
										<code className="flex-1 font-mono text-sm">
											{inviteCode}
										</code>
										<button
											type="button"
											className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
											onClick={handleCopyInviteCode}
										>
											{copied ? (
												<CheckIcon fontSize="small" />
											) : (
												<ContentCopyIcon fontSize="small" />
											)}
										</button>
									</div>
									{copied && (
										<p className="text-sm text-green-600 mt-1">
											コピーしました！
										</p>
									)}
								</div>
							)}
						</div>

						{error && (
							<div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
								{error}
							</div>
						)}
					</div>

					<div className="flex justify-end mt-6">
						<button
							type="button"
							className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
							onClick={handleClose}
						>
							閉じる
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WorkspaceSettingsModal;
