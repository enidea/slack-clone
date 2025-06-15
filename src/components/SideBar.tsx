import { useEffect, useState } from "react";
import { Home, ChatBubble } from "@mui/icons-material";
import { useAppSelector } from "../app/hooks";
import { getUser } from "../features/user/UserApi";
import type { User } from "../type/User";
import { signOut } from "../features/auth/Auth";

const SideBar = () => {
	const userId = useAppSelector((state) => state.user.userId);
	const [user, setUser] = useState<User | null>();

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

	return (
		<div className="w-16 py-3 h-screen bg-gray-900 flex flex-col items-center text-white">
			<div className="py-5 flex flex-col items-center">
				<div className="bg-gray-700 p-2 rounded-lg">
					<Home />
				</div>
				<span className="text-xs">Home</span>
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
