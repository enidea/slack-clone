import {
	Timestamp,
	addDoc,
	collection,
	doc,
	getDoc,
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
