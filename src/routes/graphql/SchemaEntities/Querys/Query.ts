import {
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import { MemberType, PostType, ProfileType, UserType } from './QueryDefs';
import { userService } from './../../services/UserService';

export const Query = new GraphQLObjectType({
	name: 'Query',
	fields: {
		users: {
			type: new GraphQLList(UserType),
			resolve: userService.getUsers,
		},
		user: {
			type: UserType,
			args: { id: { type: GraphQLID } },
			resolve: userService.getUserById,
		},
		profiles: {
			type: new GraphQLList(ProfileType),
			resolve: userService.getProfiles,
		},
		profile: {
			type: ProfileType,
			args: { id: { type: GraphQLID } },
			resolve: userService.getProfileById,
		},
		posts: {
			type: new GraphQLList(PostType),
			resolve: userService.getAllPosts,
		},
		post: {
			type: PostType,
			args: { id: { type: GraphQLID } },
			resolve: userService.getPostById,
		},
		memberTypes: {
			type: new GraphQLList(MemberType),
			resolve: userService.getMemberTypes,
		},
		memberType: {
			type: MemberType,
			args: { id: { type: GraphQLString } },
			resolve: userService.getMemberTypeById,
		},
	},
});
