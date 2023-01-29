import fetch from 'node-fetch';
import {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLInt,
} from 'graphql';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../../../utils/DB/entities/DBPosts';
import { routeUrl } from '../../config';
import { CTX } from '../..';

export const UserType: GraphQLObjectType<any, any> = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
		profile: {
			type: ProfileType,
			async resolve(parent: UserEntity) {
				const response = await fetch(`${routeUrl.profiles}`);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				const targetProfile = profiles.entities.find(
					(profile) => profile.userId === parent.id
				);

				return targetProfile;
			},
		},
		userSubscribedTo: {
			type: new GraphQLList(UserType),
			async resolve(parent: UserEntity, args: unknown, ctx: CTX) {
				return parent.subscribedToUserIds.map(async (sub) => {
					if (sub) {
						const user = await ctx.users.load(sub);
						return user[0];
					}
				});
			},
		},
		subscribedToUser: {
			type: new GraphQLList(UserType),
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
			},
		},
		posts: {
			type: new GraphQLList(PostType),
			async resolve(parent: UserEntity) {
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
			async resolve(parent: UserEntity) {
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

export const SubscribedToType = new GraphQLObjectType({
	name: 'SubscribedToType',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
		posts: {
			type: new GraphQLList(PostType),
			async resolve(parent: UserEntity) {
				const response = await fetch(`${routeUrl.posts}`);
				const posts: { entities: PostEntity[] } = await response.json();
				const targetPosts = posts.entities.filter(
					(post) => parent.id === post.userId
				);

				return targetPosts;
			},
		},
		subscribedToUser: {
			type: new GraphQLList(SubscribedToNestedType),
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
			},
		},
	}),
});

export const SubscribedToNestedType = new GraphQLObjectType({
	name: 'SubscribedToNestedType',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		posts: {
			type: new GraphQLList(PostType),
			async resolve(parent: UserEntity) {
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

export const ProfileType = new GraphQLObjectType({
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

export const PostType = new GraphQLObjectType({
	name: 'Post',
	fields: () => ({
		id: { type: GraphQLID },
		content: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	}),
});

export const MemberType = new GraphQLObjectType({
	name: 'MemberType',
	fields: () => ({
		id: { type: GraphQLString },
		discount: { type: new GraphQLNonNull(GraphQLInt) },
		monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
	}),
});

export const EntityByIdType = new GraphQLObjectType({
	name: 'EntitiesById',
	fields: () => ({
		user: { type: UserType },
		profile: { type: ProfileType },
		post: { type: PostType },
		memberType: { type: MemberType },
	}),
});

export const EntityByIdInput = new GraphQLInputObjectType({
	name: 'EntityByIdInput',
	fields: {
		userId: { type: new GraphQLNonNull(GraphQLID) },
		profileId: { type: new GraphQLNonNull(GraphQLID) },
		postId: { type: new GraphQLNonNull(GraphQLID) },
		memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
	},
});

export const UsersWithFollowersType = new GraphQLObjectType({
	name: 'UsersWithFollowersType',
	fields: {
		userSubscribedTo: { type: new GraphQLList(UserType) },
	},
});
