import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, parse } from 'graphql';
import { validate } from 'graphql/validation';
import { schema } from './schema';
import depthLimit from 'graphql-depth-limit';

const MAX_DEPTH = 6;
const REQUEST_DEPTH_ERROR = 'Request limit exceeded';

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

			try {
				if (query) {
					if (variables) {
						const validateErrors = validate(
							schema,
							parse(query),
							depthLimit(MAX_DEPTH)
						);

						if (validateErrors.length) {
							throw new Error(REQUEST_DEPTH_ERROR);
						}

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
			} catch (error) {
				if (error instanceof Error) {
					console.log(error.message);
				}
			}
		}
	);
};

export default plugin;
