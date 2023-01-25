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

const baseURL = 'http://localhost';
const port = 3000;

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
	},
});

const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: {
				firstName: { type: new GraphQLNonNull(GraphQLString) },
				lastName: { type: new GraphQLNonNull(GraphQLString) },
				email: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(
				parent,
				{ firstName, lastName, email }: Omit<UserEntity, 'id'>
			) {
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
			args: {
				avatar: { type: new GraphQLNonNull(GraphQLString) },
				sex: { type: new GraphQLNonNull(GraphQLString) },
				birthday: { type: new GraphQLNonNull(GraphQLInt) },
				country: { type: new GraphQLNonNull(GraphQLString) },
				street: { type: new GraphQLNonNull(GraphQLString) },
				city: { type: new GraphQLNonNull(GraphQLString) },
				userId: { type: new GraphQLNonNull(GraphQLID) },
				memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
			},
			async resolve(
				parent,
				{
					avatar,
					sex,
					birthday,
					country,
					street,
					city,
					userId,
					memberTypeId,
				}: Omit<ProfileEntity, 'id'>
			) {
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
					console.log(result);

					return reply.send(result);
				}

				const result = await graphql({ schema, source: query });
				return reply.send(result);
			}
		}
	);
};

export default plugin;
