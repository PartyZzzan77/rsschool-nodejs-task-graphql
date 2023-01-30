import {
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLInt,
} from 'graphql';
import { userService } from './../../services/UserService';

export const UserType: GraphQLObjectType<any, any> = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLID },
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
		profile: {
			type: ProfileType,
			resolve: userService.findProfile,
		},
		userSubscribedTo: {
			type: new GraphQLList(UserType),
			resolve: userService.getUserSubscribedTo,
		},
		subscribedToUser: {
			type: new GraphQLList(UserType),
			resolve: userService.getSubscribedToUser,
		},
		posts: {
			type: new GraphQLList(PostType),
			resolve: userService.findPosts,
		},
		memberType: {
			type: GraphQLString,
			resolve: userService.findMemberType,
		},
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
