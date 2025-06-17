import type { Timestamp } from "firebase/firestore";

export interface Workspace {
	name: string;
	description: string;
	owner_id: string;
	member_ids: string[];
	created_at: Timestamp;
	updated_at: Timestamp;
}

export interface WorkspaceRef {
	id: string;
	workspace: Workspace;
}

export interface WorkspaceMember {
	user_id: string;
	workspace_id: string;
	role: "owner" | "admin" | "member";
	joined_at: Timestamp;
}

export interface WorkspaceMemberRef {
	id: string;
	member: WorkspaceMember;
}
