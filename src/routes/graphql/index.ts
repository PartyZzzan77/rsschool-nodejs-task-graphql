import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { graphql, parse } from 'graphql';
import { validate } from 'graphql/validation';
import { schema } from './schema';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const MAX_DEPTH = 6;
const REQUEST_DEPTH_ERROR = 'Request limit exceeded';

export type CTX = {
	users: DataLoader<string, Promise<UserEntity[]>, string>;
	profiles: DataLoader<string, Promise<ProfileEntity[]>, string>;
	posts: DataLoader<string, Promise<PostEntity[]>, string>;
	memberType: DataLoader<string, Promise<MemberTypeEntity[]>, string>;
};

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

			const myBatchGetUsers = async (keys: readonly string[]) => {
				return keys.map((key) =>
					this.db.users.findMany({ key: 'id', equals: key })
				);
			};
			const myBatchGetProfiles = async (keys: readonly string[]) => {
				return keys.map((key) =>
					this.db.profiles.findMany({ key: 'id', equals: key })
				);
			};
			const myBatchGetPosts = async (keys: readonly string[]) => {
				return keys.map((key) =>
					this.db.posts.findMany({ key: 'id', equals: key })
				);
			};
			const myBatchGetMemberTypes = async (keys: readonly string[]) => {
				return keys.map((key) =>
					this.db.memberTypes.findMany({ key: 'id', equals: key })
				);
			};

			const userLoader = new DataLoader(myBatchGetUsers);
			const profileLoader = new DataLoader(myBatchGetProfiles);
			const postLoader = new DataLoader(myBatchGetPosts);
			const memberTypeLoader = new DataLoader(myBatchGetMemberTypes);

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
							contextValue: {
								users: userLoader,
								profiles: profileLoader,
								posts: postLoader,
								memberType: memberTypeLoader,
							},
						});

						return reply.send(result);
					}

					const result = await graphql({
						schema,
						source: query,
						contextValue: {
							users: userLoader,
							profiles: profileLoader,
							posts: postLoader,
							memberType: memberTypeLoader,
						},
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
