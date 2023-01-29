import { CTX } from './../index';
import fetch from 'node-fetch';
import { ProfileEntity } from '../../../utils/DB/entities/DBProfiles';
import { UserEntity } from '../../../utils/DB/entities/DBUsers';
import { routeUrl } from '../config';
import { PostEntity } from '../../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../../utils/DB/entities/DBMemberTypes';

class UserService {
	constructor() {}

	public async getProfile(parent: UserEntity) {
		const response = await fetch(`${routeUrl.profiles}`);
		const profiles: { entities: ProfileEntity[] } = await response.json();
		const targetProfile = profiles.entities.find(
			(profile) => profile.userId === parent.id
		);

		return targetProfile;
	}

	public async getUserSubscribedTo(
		parent: UserEntity,
		args: unknown,
		ctx: CTX
	) {
		return parent.subscribedToUserIds.map(async (sub) => {
			if (sub) {
				const user = await ctx.users.load(sub);
				return user[0];
			}
		});
	}

	public async getSubscribedToUser(parent: UserEntity) {
		const response = await fetch(`${routeUrl.users}`);
		const users: { entities: UserEntity[] } = await response.json();

		return users.entities
			.map((user) => {
				if (user.subscribedToUserIds.includes(parent.id)) {
					return user;
				}
			})
			.filter((el) => el);
	}

	public async getPosts(parent: UserEntity) {
		const response = await fetch(`${routeUrl.posts}`);
		const posts: { entities: PostEntity[] } = await response.json();
		const targetPosts = posts.entities.filter(
			(post) => parent.id === post.userId
		);

		return targetPosts;
	}

	public async getMemberType(parent: UserEntity) {
		const response = await fetch(`${routeUrl.profiles}`);
		const profiles: { entities: ProfileEntity[] } = await response.json();
		const profile = profiles.entities.find(
			(profile) => parent.id === profile.userId
		);

		return profile?.memberTypeId;
	}

	public async addUser(
		parent: unknown,
		{ input }: Record<'input', Omit<UserEntity, 'id'>>
	) {
		const { firstName, lastName, email } = input;
		const body = JSON.stringify({ firstName, lastName, email });
		const response = await fetch(routeUrl.users, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async addProfile(
		parent: unknown,
		{ input }: Record<'input', Omit<ProfileEntity, 'id'>>
	) {
		const {
			avatar,
			sex,
			birthday,
			country,
			street,
			city,
			userId,
			memberTypeId,
		} = input;
		const body = JSON.stringify({
			avatar,
			sex,
			birthday,
			country,
			street,
			city,
			userId,
			memberTypeId,
		});
		const response = await fetch(routeUrl.profiles, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async addPost(
		parent: unknown,
		{ input }: Record<'input', Omit<PostEntity, 'id'>>
	) {
		const { content, title, userId } = input;
		const body = JSON.stringify({ content, title, userId });
		const response = await fetch(routeUrl.posts, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async updateUser(
		parent: unknown,
		{ input }: Record<'input', UserEntity>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(`${routeUrl.users}/${input.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async updateProfile(
		parent: unknown,
		{ input }: Record<'input', Omit<ProfileEntity, 'userId'>>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(`${routeUrl.profiles}/${input.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async updatePost(
		parent: unknown,
		{ input }: Record<'input', Omit<PostEntity, 'userId'>>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(`${routeUrl.posts}/${input.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async updateMemberType(
		parent: unknown,
		{ input }: Record<'input', MemberTypeEntity>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(`${routeUrl.memberTypes}/${input.id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async subscribeUser(
		parent: unknown,
		{ input }: Record<'input', Pick<ProfileEntity, 'id' | 'userId'>>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(`${routeUrl.users}/${input.id}/subscribeTo`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		return await response.json();
	}

	public async unSubscribeUser(
		parent: unknown,
		{ input }: Record<'input', Pick<ProfileEntity, 'id' | 'userId'>>
	) {
		const body = JSON.stringify({ ...input });
		const response = await fetch(
			`${routeUrl.users}/${input.id}/unsubscribeFrom`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body,
			}
		);

		return await response.json();
	}
}

export const userService = new UserService();
