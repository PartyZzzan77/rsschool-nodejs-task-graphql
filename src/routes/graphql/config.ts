export const baseURL = 'http://localhost';
export const port = 3000;
//const depthLimitMiddleware = depthLimit(6);

export const routeUrl = {
	users: `${baseURL}:${port}/users`,
	profiles: `${baseURL}:${port}/profiles`,
	posts: `${baseURL}:${port}/posts`,
	memberTypes: `${baseURL}:${port}/member-types`,
};