import { MemberTypeEntity } from './../../utils/DB/entities/DBMemberTypes';
import { PostEntity } from './../../utils/DB/entities/DBPosts';
import { ProfileEntity } from './../../utils/DB/entities/DBProfiles';
import { UserEntity } from './../../utils/DB/entities/DBUsers';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
	graphql,
	GraphQLID,
	GraphQLInputObjectType,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';
import fetch from 'node-fetch';
//import depthLimit from 'graphql-depth-limit';

const baseURL = 'http://localhost';
const port = 3000;
//const depthLimitMiddleware = depthLimit(6);

const routeUrl = {
	users: `${baseURL}:${port}/users`,
	profiles: `${baseURL}:${port}/profiles`,
	posts: `${baseURL}:${port}/posts`,
	memberTypes: `${baseURL}:${port}/member-types`,
};

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
		profile: {
			type: ProfileType,
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.profiles}`);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				const targetProfile = profiles.entities.find(
					(profile) => profile.userId === parent.id
				);
				return targetProfile;
			},
		},
		userSubscribedTo: {
			type: new GraphQLList(UserSubscribedToType),
			async resolve(parent: UserEntity) {
				return parent.subscribedToUserIds.map(async (sub) => {
					if (sub) {
						const response = await fetch(`${routeUrl.users}/${sub}`);
						if (response) {
							return await response.json();
						}
					}
				});
			},
		},

		subscribedToUser: {
			type: new GraphQLList(SubscribedToType),
			async resolve(parent: UserEntity) {
				const response = await fetch(`${routeUrl.users}`);
				const users: { entities: UserEntity[] } = await response.json();

				return users.entities
					.map((user) => {
						if (user.subscribedToUserIds.includes(parent.id)) {
							return user;
						}
					})
					.filter((el) => el);
				//TODO null
			},
		},
		posts: {
			type: new GraphQLList(PostType),
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.posts}`);
				const posts: { entities: PostEntity[] } = await response.json();
				const targetPosts = posts.entities.filter(
					(post) => parent.id === post.userId
				);
				return targetPosts;
			},
		},
		memberType: {
			type: GraphQLString,
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.profiles}`);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				const profile = profiles.entities.find(
					(profile) => parent.id === profile.userId
				);

				return profile?.memberTypeId;
			},
		},
	}),
});

const UserSubscribedToType = new GraphQLObjectType({
	name: 'userSubscribedToType',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
		subscribedTo: { type: new GraphQLList(GraphQLID) },
		profile: {
			type: ProfileType,
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.profiles}`);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				const targetProfile = profiles.entities.find(
					(profile) => profile.userId === parent.id
				);
				return targetProfile;
			},
		},
	}),
});

const SubscribedToType = new GraphQLObjectType({
	name: 'SubscribedToType',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		posts: {
			type: new GraphQLList(PostType),
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.posts}`);
				const posts: { entities: PostEntity[] } = await response.json();
				const targetPosts = posts.entities.filter(
					(post) => parent.id === post.userId
				);
				return targetPosts;
			},
		},
		email: { type: new GraphQLNonNull(GraphQLString) },
		subscribedTo: { type: new GraphQLList(GraphQLID) },
	}),
});

const ProfileType = new GraphQLObjectType({
	name: 'Profile',
	fields: () => ({
		id: { type: GraphQLID },
		avatar: { type: new GraphQLNonNull(GraphQLString) },
		sex: { type: new GraphQLNonNull(GraphQLString) },
		birthday: { type: new GraphQLNonNull(GraphQLInt) },
		country: { type: new GraphQLNonNull(GraphQLString) },
		street: { type: new GraphQLNonNull(GraphQLString) },
		city: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
		memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
	}),
});

const PostType = new GraphQLObjectType({
	name: 'Post',
	fields: () => ({
		id: { type: GraphQLID },
		content: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	}),
});

const MemberType = new GraphQLObjectType({
	name: 'MemberType',
	fields: () => ({
		id: { type: GraphQLString },
		discount: { type: new GraphQLNonNull(GraphQLInt) },
		monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
	}),
});

const EntityByIdType = new GraphQLObjectType({
	name: 'EntitiesById',
	fields: () => ({
		user: { type: UserType },
		profile: { type: ProfileType },
		post: { type: PostType },
		memberType: { type: MemberType },
	}),
});

const EntityByIdInput = new GraphQLInputObjectType({
	name: 'EntityByIdInput',
	fields: {
		userId: { type: new GraphQLNonNull(GraphQLID) },
		profileId: { type: new GraphQLNonNull(GraphQLID) },
		postId: { type: new GraphQLNonNull(GraphQLID) },
		memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
	},
});

const UsersWithFollowersType = new GraphQLObjectType({
	name: 'UsersWithFollowersType',
	fields: {
		userSubscribedTo: { type: new GraphQLList(UserType) },
	},
});

const Query = new GraphQLObjectType({
	name: 'Query',
	fields: {
		users: {
			type: new GraphQLList(UserType),
			async resolve(): Promise<UserEntity[]> {
				const response = await fetch(routeUrl.users);
				const users: { entities: UserEntity[] } = await response.json();
				return users.entities;
			},
		},
		user: {
			type: UserType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.users}/${args.id}`);

				return await response.json();
			},
		},
		profiles: {
			type: new GraphQLList(ProfileType),
			async resolve() {
				const response = await fetch(routeUrl.profiles);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				return profiles.entities;
			},
		},
		profile: {
			type: ProfileType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.profiles}/${args.id}`);

				return await response.json();
			},
		},
		posts: {
			type: new GraphQLList(PostType),
			async resolve() {
				const response = await fetch(routeUrl.posts);
				const posts: { entities: PostEntity[] } = await response.json();
				return posts.entities;
			},
		},
		post: {
			type: PostType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.posts}/${args.id}`);

				return await response.json();
			},
		},
		memberTypes: {
			type: new GraphQLList(MemberType),
			async resolve() {
				const response = await fetch(routeUrl.memberTypes);
				const memberTypes: { entities: MemberTypeEntity[] } =
					await response.json();
				return memberTypes.entities;
			},
		},
		memberType: {
			type: MemberType,
			args: { id: { type: GraphQLString } },
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.memberTypes}/${args.id}`);

				return await response.json();
			},
		},
		getEntitlesById: {
			type: EntityByIdType,
			args: { input: { type: EntityByIdInput } },
		},
		getUserById: {
			type: UserType,
			args: { id: { type: new GraphQLNonNull(GraphQLID) } },
		},
		getUsersWithFollowers: {
			type: UsersWithFollowersType,
			async resolve(parent: UserEntity, args: unknown) {
				const response = await fetch(`${routeUrl.users}`);
				const users: { entities: UserEntity[] } = await response.json();
				const subscribers = users.entities.filter((subscriber) =>
					subscriber.subscribedToUserIds.includes(parent.id)
				);
				return subscribers;
			},
		},
	},
});

const addUserDtoInput = new GraphQLInputObjectType({
	name: 'addUserDtoInput',
	fields: {
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
	},
});

const updateUserDtoInput = new GraphQLInputObjectType({
	name: 'updateUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString },
		email: { type: GraphQLString },
	},
});

const addProfileDtoInput = new GraphQLInputObjectType({
	name: 'addProfileDtoInput',
	fields: {
		avatar: { type: new GraphQLNonNull(GraphQLString) },
		sex: { type: new GraphQLNonNull(GraphQLString) },
		birthday: { type: new GraphQLNonNull(GraphQLInt) },
		country: { type: new GraphQLNonNull(GraphQLString) },
		street: { type: new GraphQLNonNull(GraphQLString) },
		city: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
		memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
	},
});

const updateProfileDtoInput = new GraphQLInputObjectType({
	name: 'updateProfileDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		avatar: { type: GraphQLString },
		sex: { type: GraphQLString },
		birthday: { type: GraphQLInt },
		country: { type: GraphQLString },
		street: { type: GraphQLString },
		city: { type: GraphQLString },
		memberTypeId: { type: GraphQLString },
	},
});

const addPostDtoInput = new GraphQLInputObjectType({
	name: 'addPostDtoInput',
	fields: {
		content: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

const updatePostDtoInput = new GraphQLInputObjectType({
	name: 'updatePostDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		content: { type: GraphQLString },
		title: { type: GraphQLString },
	},
});

const updateMemberDtoInput = new GraphQLInputObjectType({
	name: 'updateMemberDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		discount: { type: GraphQLInt },
		monthPostsLimit: { type: GraphQLInt },
	},
});

const subscribeUserDtoInput = new GraphQLInputObjectType({
	name: 'subscribeUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

const unSubscribeUserDtoInput = new GraphQLInputObjectType({
	name: 'unSubscribeUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

const Mutation = new GraphQLObjectType({
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

export const schema = new GraphQLSchema({
	query: Query,
	mutation: Mutation,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.post(
		'/',
		{
			schema: {
				body: graphqlBodySchema,
			},
		},
		async function (request, reply) {
			const { query, variables } = request.body;

			if (query) {
				if (variables) {
					const result = await graphql({
						schema,
						source: query,
						variableValues: variables,
					});

					return reply.send(result);
				}

				const result = await graphql({
					schema,
					source: query,
				});
				return reply.send(result);
			}
		}
	);
};

export default plugin;
