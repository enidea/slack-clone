import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../user/UserSlice";

const initialState = {
	currentWorkspaceId: "",
	workspaceName: "",
};

export const workspaceSlice = createSlice({
	name: "workspace",
	initialState,
	reducers: {
		selectWorkspace: (state, action) => {
			state.currentWorkspaceId = action.payload.id;
			state.workspaceName = action.payload.name;
		},
		clearWorkspace: (state) => {
			state.currentWorkspaceId = "";
			state.workspaceName = "";
		},
	},
	extraReducers: (builder) => {
		builder.addCase(logout, (state) => {
			state.currentWorkspaceId = "";
			state.workspaceName = "";
		});
	},
});

export const { selectWorkspace, clearWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
