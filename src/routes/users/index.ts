import { Constants } from './../../utils/constants';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
	createUserBodySchema,
	changeUserBodySchema,
	subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';


const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
		return reply.send(this.db.users)
	});

	fastify.get(
		'/:id',
		{
			schema: {
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<UserEntity> {
			const { id } = request.params;
			const user = await this.db.users.findOne({ key: 'id', equals: id });

			if (!user) {
				return reply.status(404).send({ message: Constants.USER_ERROR });
			}

			return reply.send(user);
		}
	);

	fastify.post(
		'/',
		{
			schema: {
				body: createUserBodySchema,
			},
		},
		async function (request, reply): Promise<UserEntity> {
			const newUser = (await this.db.users.create(request.body)) || {};

			return reply.status(201).send(newUser);
		}
	);

	// fastify.delete(
	// 	'/:id',
	// 	{
	// 		schema: {
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<UserEntity> {}
	// );

	fastify.post(
		'/:id/subscribeTo',
		{
			schema: {
				body: subscribeBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<UserEntity> {
			const { id } = request.params;
			const { userId } = request.body;
			const subscriber = await this.db.users.findOne({ key: 'id', equals: id });
			const candidate = await this.db.users.findOne({ key: 'id', equals: userId });

			if (!subscriber || !candidate) {
				return reply.status(404).send({ message: Constants.NOT_FOUND });
			}
			const isFollower = subscriber.subscribedToUserIds.includes(userId);

			if (isFollower) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const subscriberSubscribedToIds = [candidate.id, ...subscriber.subscribedToUserIds];

			const candidateSubscribedToUserIds = [subscriber.id, ...candidate.subscribedToUserIds];

			const updatedUser = await this.db.users.change(id, {
				subscribedToUserIds: subscriberSubscribedToIds,
			});

			await this.db.users.change(userId, {
				subscribedToUserIds: candidateSubscribedToUserIds,
			});

			return reply.status(200).send(updatedUser);
		}
	);

	// fastify.post(
	// 	'/:id/unsubscribeFrom',
	// 	{
	// 		schema: {
	// 			body: subscribeBodySchema,
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<UserEntity> {}
	// );

	fastify.patch(
		'/:id',
		{
			schema: {
				body: changeUserBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<UserEntity> {
			const { id } = request.params;
			const { body } = request;
			const candidate = await this.db.users.findOne({ key: 'id', equals: id });

			if (!candidate) {
				reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const updatedUser = await this.db.users.change(id, body);

			return reply.send(updatedUser);
		}
	);
};

export default plugin;
