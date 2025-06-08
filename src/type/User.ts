export interface User {
	profile_picture: string;
	email: string;
	display_name: string;
}

export interface UserRef {
	uid: string;
	user: User;
}
