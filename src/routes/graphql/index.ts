import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
	graphql,
} from 'graphql';
import { schema } from './schema'

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
