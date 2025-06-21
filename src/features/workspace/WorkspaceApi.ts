import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	updateDoc,
	where,
} from "firebase/firestore";
import db from "../../infra/db";
import type {
	Workspace,
	WorkspaceMember,
	WorkspaceMemberRef,
	WorkspaceRef,
} from "../../type/Workspace";

export const createWorkspace = (
	name: string,
	description: string,
	ownerId: string,
): Workspace => {
	const timestamp = Timestamp.fromDate(new Date());
	return {
		name,
		description,
		owner_id: ownerId,
		member_ids: [ownerId],
		created_at: timestamp,
		updated_at: timestamp,
	};
};

export const postWorkspace = async (workspace: Workspace) => {
	const docRef = await addDoc(collection(db, "workspaces"), workspace);

	// ワークスペース作成者をメンバーとして追加
	const memberData: WorkspaceMember = {
		user_id: workspace.owner_id,
		workspace_id: docRef.id,
		role: "owner",
		joined_at: workspace.created_at,
	};

	await addDoc(collection(db, "workspace_members"), memberData);
	return docRef.id;
};

export const subscribeUserWorkspaces = (
	userId: string,
	onWorkspacesUpdated: (workspaces: WorkspaceRef[]) => void,
) => {
	const q = query(
		collection(db, "workspace_members"),
		where("user_id", "==", userId),
	);

	return onSnapshot(
		q,
		async (querySnapshot) => {
			const workspaceRefs: WorkspaceRef[] = [];

			for (const memberDoc of querySnapshot.docs) {
				const memberData = memberDoc.data() as WorkspaceMember;
				const workspaceDoc = await getDoc(
					doc(db, "workspaces", memberData.workspace_id),
				);

				if (workspaceDoc.exists()) {
					workspaceRefs.push({
						id: workspaceDoc.id,
						workspace: workspaceDoc.data() as Workspace,
					});
				}
			}

			onWorkspacesUpdated(workspaceRefs);
		},
		(error) => {
			console.error("Failed to subscribe user workspaces:", error);
		},
	);
};

export const getWorkspace = async (
	workspaceId: string,
): Promise<Workspace | undefined> => {
	const workspaceDoc = await getDoc(doc(db, "workspaces", workspaceId));
	if (workspaceDoc.exists()) {
		return workspaceDoc.data() as Workspace;
	}
};

export const subscribeWorkspaceMembers = (
	workspaceId: string,
	onMembersUpdated: (members: WorkspaceMemberRef[]) => void,
) => {
	const q = query(
		collection(db, "workspace_members"),
		where("workspace_id", "==", workspaceId),
	);

	return onSnapshot(
		q,
		(querySnapshot) => {
			const memberRefs: WorkspaceMemberRef[] = [];
			for (const doc of querySnapshot.docs) {
				memberRefs.push({
					id: doc.id,
					member: doc.data() as WorkspaceMember,
				});
			}
			onMembersUpdated(memberRefs);
		},
		(error) => {
			console.error("Failed to subscribe workspace members:", error);
		},
	);
};

export const addWorkspaceMember = async (
	workspaceId: string,
	userId: string,
	role: "admin" | "member" = "member",
) => {
	const memberData: WorkspaceMember = {
		user_id: userId,
		workspace_id: workspaceId,
		role,
		joined_at: Timestamp.fromDate(new Date()),
	};

	await addDoc(collection(db, "workspace_members"), memberData);

	// ワークスペースのmember_idsも更新
	const workspaceRef = doc(db, "workspaces", workspaceId);
	const workspaceDoc = await getDoc(workspaceRef);

	if (workspaceDoc.exists()) {
		const workspace = workspaceDoc.data() as Workspace;
		const updatedMemberIds = [...workspace.member_ids, userId];

		await updateDoc(workspaceRef, {
			member_ids: updatedMemberIds,
			updated_at: Timestamp.fromDate(new Date()),
		});
	}
};

// ワークスペース招待コードの生成と管理
export const generateInviteCode = async (
	workspaceId: string,
): Promise<string> => {
	const inviteCode =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15);
	const inviteData = {
		workspace_id: workspaceId,
		invite_code: inviteCode,
		created_at: Timestamp.fromDate(new Date()),
		expires_at: Timestamp.fromDate(
			new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		), // 7日後に期限切れ
		is_active: true,
	};

	await addDoc(collection(db, "workspace_invites"), inviteData);
	return inviteCode;
};

// 招待コードでワークスペースを検索
export const getWorkspaceByInviteCode = async (
	inviteCode: string,
): Promise<{ workspace: Workspace; workspaceId: string } | null> => {
	const q = query(
		collection(db, "workspace_invites"),
		where("invite_code", "==", inviteCode),
		where("is_active", "==", true),
	);

	const querySnapshot = await getDocs(q);

	if (querySnapshot.empty) {
		return null;
	}

	const inviteDoc = querySnapshot.docs[0];
	const inviteData = inviteDoc.data();

	// 期限切れチェック
	if (inviteData.expires_at.toDate() < new Date()) {
		return null;
	}

	const workspaceDoc = await getDoc(
		doc(db, "workspaces", inviteData.workspace_id),
	);

	if (!workspaceDoc.exists()) {
		return null;
	}

	return {
		workspace: workspaceDoc.data() as Workspace,
		workspaceId: workspaceDoc.id,
	};
};

// ユーザーがワークスペースのメンバーかどうかチェック
export const isUserWorkspaceMember = async (
	userId: string,
	workspaceId: string,
): Promise<boolean> => {
	const q = query(
		collection(db, "workspace_members"),
		where("user_id", "==", userId),
		where("workspace_id", "==", workspaceId),
	);

	const querySnapshot = await getDocs(q);
	return !querySnapshot.empty;
};

// 招待コードを使ってワークスペースに参加
export const joinWorkspaceByInviteCode = async (
	userId: string,
	inviteCode: string,
): Promise<string> => {
	const workspaceInfo = await getWorkspaceByInviteCode(inviteCode);

	if (!workspaceInfo) {
		throw new Error("無効な招待コードです");
	}

	const { workspaceId } = workspaceInfo;

	// 既にメンバーかどうかチェック
	const isMember = await isUserWorkspaceMember(userId, workspaceId);
	if (isMember) {
		throw new Error("既にワークスペースのメンバーです");
	}

	// メンバーとして追加
	await addWorkspaceMember(workspaceId, userId, "member");

	return workspaceId;
};
