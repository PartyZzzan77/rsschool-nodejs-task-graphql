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
import { userService } from './../../services/UserService';

export const Mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: { input: { type: addUserDtoInput } },
			resolve: userService.addUser,
		},
		addProfile: {
			type: ProfileType,
			args: { input: { type: addProfileDtoInput } },
			resolve: userService.addProfile,
		},
		addPost: {
			type: PostType,
			args: { input: { type: addPostDtoInput } },
			resolve: userService.addPost,
		},
		updateUser: {
			type: UserType,
			args: { input: { type: updateUserDtoInput } },
			resolve: userService.updateUser,
		},
		updateProfile: {
			type: ProfileType,
			args: { input: { type: updateProfileDtoInput } },
			resolve: userService.updateProfile,
		},
		updatePost: {
			type: PostType,
			args: { input: { type: updatePostDtoInput } },
			resolve: userService.updatePost,
		},
		updateMemberType: {
			type: MemberType,
			args: { input: { type: updateMemberDtoInput } },
			resolve: userService.updateMemberType,
		},
		subscribeUser: {
			type: UserType,
			args: { input: { type: subscribeUserDtoInput } },
			resolve: userService.subscribeUser,
		},
		unSubscribeUser: {
			type: UserType,
			args: { input: { type: unSubscribeUserDtoInput } },
			resolve: userService.unSubscribeUser,
		},
	},
});
