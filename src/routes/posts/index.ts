import { Constants } from './../../utils/constants';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
	//createPostBodySchema,
	//changePostBodySchema
} from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
		return reply.send(this.db.posts);
	});

	fastify.get(
		'/:id',
		{
			schema: {
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<PostEntity> {
			const { id } = request.params;
			const post = await this.db.posts.findOne({ key: 'id', equals: id });

			if (!post) {
				return reply.status(404).send({ message: Constants.POST_ERROR });
			}

			return reply.send(post);
		}
	);

	// fastify.post(
	// 	'/',
	// 	{
	// 		schema: {
	// 			body: createPostBodySchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<PostEntity> {}
	// );

	// fastify.delete(
	// 	'/:id',
	// 	{
	// 		schema: {
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<PostEntity> {}
	// );

	// fastify.patch(
	// 	'/:id',
	// 	{
	// 		schema: {
	// 			body: changePostBodySchema,
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<PostEntity> {}
	// );
};

export default plugin;
