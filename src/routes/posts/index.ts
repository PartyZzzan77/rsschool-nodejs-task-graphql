import { Constants } from './../../utils/constants';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
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

	fastify.post(
		'/',
		{
			schema: {
				body: createPostBodySchema,
			},
		},
		async function (request, reply): Promise<PostEntity> {
			const { userId } = request.body;

			const user = await this.db.users.findOne({ key: 'id', equals: userId });

			if (!user) {
				return reply.status(404).send({ message: Constants.USER_ERROR });
			}

			const newPost = (await this.db.posts.create(request.body)) || {};

			return reply.send(newPost);
		}
	);

	// fastify.delete(
	// 	'/:id',
	// 	{
	// 		schema: {
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<PostEntity> {}
	// );

	fastify.patch(
		'/:id',
		{
			schema: {
				body: changePostBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<PostEntity> {
			const { id } = request.params;
			const { body } = request;
			const post = await this.db.posts.findOne({ key: 'id', equals: id });

			if (!post) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const updatedPost = await this.db.posts.change(id, body);

			return reply.send(updatedPost);
		}
	);
};

export default plugin;
