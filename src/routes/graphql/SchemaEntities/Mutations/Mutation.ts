import fetch from 'node-fetch';
import { GraphQLObjectType } from 'graphql';
import {
	addPostDtoInput,
	addProfileDtoInput,
	addUserDtoInput,
	subscribeUserDtoInput,
	unSubscribeUserDtoInput,
	updateMemberDtoInput,
	updatePostDtoInput,
	updateProfileDtoInput,
	updateUserDtoInput,
} from './MutationDefs';
import {
	MemberType,
	PostType,
	ProfileType,
	UserType,
} from '../Querys/QueryDefs';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../../../utils/DB/entities/DBMemberTypes';
import { routeUrl } from '../../config';

export const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: { input: { type: addUserDtoInput } },
			async resolve(
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
			},
		},
		addProfile: {
			type: ProfileType,
			args: { input: { type: addProfileDtoInput } },
			async resolve(
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
			},
		},
		addPost: {
			type: PostType,
			args: { input: { type: addPostDtoInput } },
			async resolve(
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
			},
		},
		updateUser: {
			type: UserType,
			args: { input: { type: updateUserDtoInput } },
			async resolve(parent: unknown, { input }: Record<'input', UserEntity>) {
				const body = JSON.stringify({ ...input });
				const response = await fetch(`${routeUrl.users}/${input.id}`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
				});

				return await response.json();
			},
		},
		updateProfile: {
			type: ProfileType,
			args: { input: { type: updateProfileDtoInput } },
			async resolve(
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
			},
		},
		updatePost: {
			type: PostType,
			args: { input: { type: updatePostDtoInput } },
			async resolve(
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
			},
		},
		updateMemberType: {
			type: MemberType,
			args: { input: { type: updateMemberDtoInput } },
			async resolve(
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
			},
		},
		subscribeUser: {
			type: UserType,
			args: { input: { type: subscribeUserDtoInput } },
			async resolve(
				parent: unknown,
				{ input }: Record<'input', Pick<ProfileEntity, 'id' | 'userId'>>
			) {
				const body = JSON.stringify({ ...input });
				const response = await fetch(
					`${routeUrl.users}/${input.id}/subscribeTo`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body,
					}
				);

				return await response.json();
			},
		},
		unSubscribeUser: {
			type: UserType,
			args: { input: { type: unSubscribeUserDtoInput } },
			async resolve(
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
			},
		},
	},
});
