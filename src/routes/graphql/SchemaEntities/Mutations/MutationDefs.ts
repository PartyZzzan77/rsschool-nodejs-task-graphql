import { GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';

export const addUserDtoInput = new GraphQLInputObjectType({
	name: 'addUserDtoInput',
	fields: {
		firstName: { type: new GraphQLNonNull(GraphQLString) },
		lastName: { type: new GraphQLNonNull(GraphQLString) },
		email: { type: new GraphQLNonNull(GraphQLString) },
	},
});

export const updateUserDtoInput = new GraphQLInputObjectType({
	name: 'updateUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString },
		email: { type: GraphQLString },
	},
});

export const addProfileDtoInput = new GraphQLInputObjectType({
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

export const updateProfileDtoInput = new GraphQLInputObjectType({
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

export const addPostDtoInput = new GraphQLInputObjectType({
	name: 'addPostDtoInput',
	fields: {
		content: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

export const updatePostDtoInput = new GraphQLInputObjectType({
	name: 'updatePostDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		content: { type: GraphQLString },
		title: { type: GraphQLString },
	},
});

export const updateMemberDtoInput = new GraphQLInputObjectType({
	name: 'updateMemberDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		discount: { type: GraphQLInt },
		monthPostsLimit: { type: GraphQLInt },
	},
});

export const subscribeUserDtoInput = new GraphQLInputObjectType({
	name: 'subscribeUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});

export const unSubscribeUserDtoInput = new GraphQLInputObjectType({
	name: 'unSubscribeUserDtoInput',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		userId: { type: new GraphQLNonNull(GraphQLID) },
	},
});