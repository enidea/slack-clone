import { createSlice } from "@reduxjs/toolkit";
import { logout } from "../user/UserSlice";

const initialState = {
	currentChannelId: "",
};

export const channelSlice = createSlice({
	name: "channelId",
	initialState,
	reducers: {
		selectChannel: (state, action) => {
			state.currentChannelId = action.payload;
		},
		clearChannel: (state) => {
			state.currentChannelId = "";
		},
	},
	extraReducers: (builder) => {
		builder.addCase(logout, (state) => {
			state.currentChannelId = "";
		});
	},
});

export const { selectChannel, clearChannel } = channelSlice.actions;
export default channelSlice.reducer;
