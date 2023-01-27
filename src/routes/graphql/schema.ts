import { GraphQLSchema } from 'graphql';
import { Query } from './SchemaEntities/Querys/Query';
import { Mutation } from './SchemaEntities/Mutations/Mutation';

export const graphqlBodySchema = {
	type: 'object',
	properties: {
		mutation: { type: 'string' },
		query: { type: 'string' },
		variables: {
			type: 'object',
		},
	},
	oneOf: [
		{
			type: 'object',
			required: ['query'],
			properties: {
				query: { type: 'string' },
				variables: {
					type: 'object',
				},
			},
			additionalProperties: false,
		},
		{
			type: 'object',
			required: ['mutation'],
			properties: {
				mutation: { type: 'string' },
				variables: {
					type: 'object',
				},
			},
			additionalProperties: false,
		},
	],
} as const;

export const schema = new GraphQLSchema({
	query: Query,
	mutation: Mutation,
});
