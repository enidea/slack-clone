import { configureStore } from "@reduxjs/toolkit";
import channelReducer from "../features/channel/ChannelSlice";
import userReducer from "../features/user/UserSlice";
import workspaceReducer from "../features/workspace/WorkspaceSlice";

export const store = configureStore({
	reducer: {
		user: userReducer,
		channel: channelReducer,
		workspace: workspaceReducer,
	},
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
