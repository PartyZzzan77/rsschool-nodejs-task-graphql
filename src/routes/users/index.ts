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

	fastify.delete(
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
				reply.status(400).send({ message: Constants.USER_ERROR });
			}

			const deletedUser = await this.db.users.delete(id);
			const followers = await this.db.users.findMany({
				key: 'subscribedToUserIds',
				equals: [deletedUser.id],
			});
			const posts = await this.db.posts.findMany({ key: 'userId', equals: deletedUser.id });
			const profile = await this.db.profiles.findOne({
				key: 'userId',
				equals: deletedUser.id,
			});
			if (profile) {
				await this.db.profiles.delete(profile.id);
			}

			followers.forEach(
				async (follower) =>
					await this.db.users.change(follower.id, {
						subscribedToUserIds: [...follower.subscribedToUserIds].filter(
							(fId) => fId !== deletedUser.id
						),
					})
			);

			posts.forEach(async (post) => await this.db.posts.delete(post.id));

			return reply.send(deletedUser);
		}
	);

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

	fastify.post(
		'/:id/unsubscribeFrom',
		{
			schema: {
				body: subscribeBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<UserEntity> {
			const { id } = request.params;
			const { userId } = request.body;
			const unSubscriber = await this.db.users.findOne({ key: 'id', equals: id });
			const candidate = await this.db.users.findOne({ key: 'id', equals: userId });

			if (!unSubscriber || !candidate) {
				return reply.status(404).send({ message: Constants.NOT_FOUND });
			}

			const isFollower = unSubscriber.subscribedToUserIds.includes(userId);
			const isSubscriber = candidate.subscribedToUserIds.includes(id);

			if (!isFollower || !isSubscriber) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const unSubscriberSubscribedToIds = [...unSubscriber.subscribedToUserIds].filter(
				(sub) => sub !== userId
			);
			const updatedUser = await this.db.users.change(id, {
				subscribedToUserIds: unSubscriberSubscribedToIds,
			});

			const candidateSubscribedToUserIds = [...candidate.subscribedToUserIds].filter(
				(sub) => sub !== id
			);

			await this.db.users.change(userId, {
				subscribedToUserIds: candidateSubscribedToUserIds,
			});

			return reply.send(updatedUser);
		}
	);

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
