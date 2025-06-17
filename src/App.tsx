import SideBar from "./components/SideBar";
import ChatContainer from "./components/ChatContainer";
import Login from "./components/Login";
import WorkspaceSelector from "./components/WorkspaceSelector";
import { useAppSelector } from "./app/hooks";
import useAuthState from "./features/auth/UseAuthState";

function App() {
	useAuthState();

	const userId = useAppSelector((state) => state.user.userId);
	const currentWorkspaceId = useAppSelector(
		(state) => state.workspace.currentWorkspaceId,
	);

	// ログインしていない場合はログイン画面
	if (!userId) {
		return <Login />;
	}

	// ログインしているがワークスペースが選択されていない場合はワークスペース選択画面
	if (!currentWorkspaceId) {
		return <WorkspaceSelector />;
	}

	// ログインしてワークスペースも選択されている場合はメイン画面
	return (
		<div className="flex">
			<SideBar />
			<ChatContainer />
		</div>
	);
}

export default App;
