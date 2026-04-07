import { getToken } from "./auth-server";

// This is a wrapper function to make it easy to change if we decide to use a different auth library
export async function getTokenFromServer() {
	const token = await getToken();

	return token;
}
