import { configureStore } from "@reduxjs/toolkit";
import channelReducer from "../features/channel/ChannelSlice";
import userReducer from "../features/user/UserSlice";

export const store = configureStore({
	reducer: {
		user: userReducer,
		channel: channelReducer,
	},
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
