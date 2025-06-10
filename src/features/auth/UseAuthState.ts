import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "../user/UserSlice";
import { auth } from "./Auth";

const useAuthState = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((loginUser) => {
			if (loginUser) {
				dispatch(login(loginUser.uid));
			} else {
				dispatch(logout());
			}
		});

		return unsubscribe;
	}, [dispatch]);

	return;
};

export default useAuthState;
