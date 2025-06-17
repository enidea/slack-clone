import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectWorkspace } from "../features/workspace/WorkspaceSlice";
import {
	subscribeUserWorkspaces,
	createWorkspace,
	postWorkspace,
} from "../features/workspace/WorkspaceApi";
import type { WorkspaceRef } from "../type/Workspace";
import AddIcon from "@mui/icons-material/Add";

const WorkspaceSelector = () => {
	const [workspaces, setWorkspaces] = useState<WorkspaceRef[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceDescription, setWorkspaceDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const dispatch = useAppDispatch();
	const userId = useAppSelector((state) => state.user.userId);

	useEffect(() => {
		if (userId) {
			const unsubscribe = subscribeUserWorkspaces(userId, (workspaceRefs) => {
				setWorkspaces(workspaceRefs);
			});
			return unsubscribe;
		}
	}, [userId]);

	const handleSelectWorkspace = (workspace: WorkspaceRef) => {
		dispatch(
			selectWorkspace({
				id: workspace.id,
				name: workspace.workspace.name,
			}),
		);
	};

	const handleCreateWorkspace = async () => {
		if (!workspaceName.trim() || !userId || isCreating) return;

		setIsCreating(true);
		try {
			const newWorkspace = createWorkspace(
				workspaceName.trim(),
				workspaceDescription.trim(),
				userId,
			);

			const workspaceId = await postWorkspace(newWorkspace);

			// 作成したワークスペースを自動選択
			dispatch(
				selectWorkspace({
					id: workspaceId,
					name: workspaceName.trim(),
				}),
			);

			// モーダルを閉じる
			setShowCreateModal(false);
			setWorkspaceName("");
			setWorkspaceDescription("");
		} catch (error) {
			console.error("Failed to create workspace:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleCloseModal = () => {
		setShowCreateModal(false);
		setWorkspaceName("");
		setWorkspaceDescription("");
	};

	return (
		<div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
				<div className="p-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
						ワークスペースを選択
					</h2>

					<div className="space-y-3 mb-6">
						{workspaces.length > 0 ? (
							workspaces.map((workspace) => (
								<button
									key={workspace.id}
									type="button"
									className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
									onClick={() => handleSelectWorkspace(workspace)}
								>
									<div className="font-semibold text-gray-800">
										{workspace.workspace.name}
									</div>
									{workspace.workspace.description && (
										<div className="text-sm text-gray-600 mt-1">
											{workspace.workspace.description}
										</div>
									)}
									<div className="text-xs text-gray-500 mt-2">
										{workspace.workspace.member_ids.length} メンバー
									</div>
								</button>
							))
						) : (
							<div className="text-center text-gray-500 py-8">
								参加しているワークスペースがありません
							</div>
						)}
					</div>

					<button
						type="button"
						className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
						onClick={() => setShowCreateModal(true)}
					>
						<AddIcon fontSize="small" />
						新しいワークスペースを作成
					</button>
				</div>
			</div>

			{/* 作成モーダル */}
			{showCreateModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
						<div className="p-6">
							<h3 className="text-xl font-bold text-gray-800 mb-4">
								ワークスペースを作成
							</h3>

							<div className="space-y-4">
								<div>
									<label
										htmlFor="workspaceName"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										ワークスペース名 *
									</label>
									<input
										id="workspaceName"
										type="text"
										value={workspaceName}
										onChange={(e) => setWorkspaceName(e.target.value)}
										className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
										placeholder="ワークスペース名を入力してください"
										maxLength={50}
									/>
								</div>
								<div>
									<label
										htmlFor="workspaceDescription"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										説明（任意）
									</label>
									<textarea
										id="workspaceDescription"
										value={workspaceDescription}
										onChange={(e) => setWorkspaceDescription(e.target.value)}
										className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
										placeholder="ワークスペースの説明を入力してください"
										rows={3}
										maxLength={200}
									/>
								</div>
							</div>

							<div className="flex gap-3 mt-6">
								<button
									type="button"
									className="flex-1 p-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
									onClick={handleCloseModal}
									disabled={isCreating}
								>
									キャンセル
								</button>
								<button
									type="button"
									className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									onClick={handleCreateWorkspace}
									disabled={!workspaceName.trim() || isCreating}
								>
									{isCreating ? "作成中..." : "作成"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default WorkspaceSelector;
