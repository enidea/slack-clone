import { useEffect, useState } from "react";
import { ChatBubble, Business } from "@mui/icons-material";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { getUser } from "../features/user/UserApi";
import { clearWorkspace } from "../features/workspace/WorkspaceSlice";
import type { User } from "../type/User";
import { signOut } from "../features/auth/Auth";
import { clearChannel } from "../features/channel/ChannelSlice";

const SideBar = () => {
	const userId = useAppSelector((state) => state.user.userId);
	const workspaceName = useAppSelector(
		(state) => state.workspace.workspaceName,
	);
	const [user, setUser] = useState<User | null>();
	const dispatch = useAppDispatch();

	useEffect(() => {
		const fetchUser = async () => {
			if (userId) {
				const userRef = await getUser(userId);
				if (userRef) {
					setUser(userRef);
				}
			}
		};

		fetchUser();
	}, [userId]);

	const handleSwitchWorkspace = () => {
		dispatch(clearWorkspace());
		dispatch(clearChannel());
	};

	return (
		<div className="w-16 py-3 h-screen bg-gray-900 flex flex-col items-center text-white">
			<div className="py-5 flex flex-col items-center">
				<div className="bg-gray-700 p-2 rounded-lg">
					<button
						type="button"
						className="hover:bg-gray-600 cursor-pointer rounded-lg flex items-center justify-center w-full h-full"
						onClick={handleSwitchWorkspace}
						title={`ワークスペース: ${workspaceName}`}
					>
						<Business />
					</button>
				</div>
				<span className="text-xs text-center">
					{workspaceName ? workspaceName.slice(0, 6) : "WS"}
				</span>
			</div>
			<div className="py-5 flex flex-col items-center">
				<div className="bg-gray-700 p-2 rounded-lg">
					<ChatBubble />
				</div>
				<span className="text-xs">DM</span>
			</div>
			<div className="py-5 mt-auto mx-2 flex flex-col items-center">
				<div className="bg-gray-700 p-2 rounded-lg">
					<button
						type="button"
						className="hover:bg-gray-600 cursor-pointer rounded-lg flex items-center justify-center w-full h-full"
						onClick={signOut}
					>
						<img
							src={user?.profile_picture}
							alt="User Profile"
							className="rounded-full object-cover"
						/>
					</button>
				</div>
				<span className="text-xs">{user?.display_name}</span>
			</div>
		</div>
	);
};

export default SideBar;
