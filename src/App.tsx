import SideBar from "./components/SideBar";
import ChatContainer from "./components/ChatContainer";
import Login from "./components/Login";

function App() {
	return (
		<div className="flex">
			<Login />
			<SideBar />
			<ChatContainer />
		</div>
	);
}

export default App;
