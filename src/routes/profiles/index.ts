import { Constants } from './../../utils/constants';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.get('/', async function (request, reply): Promise<
		ProfileEntity[]
	> {
		return reply.send(this.db.profiles);
	});

	fastify.get(
		'/:id',
		{
			schema: {
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<ProfileEntity> {
			const { id } = request.params;
			const profile = await this.db.profiles.findOne({ key: 'id', equals: id });

			if (!profile) {
				return reply.status(404).send({ message: Constants.PROFILE_ERROR });
			}

			return reply.send(profile);
		}
	);

	fastify.post(
		'/',
		{
			schema: {
				body: createProfileBodySchema,
			},
		},
		async function (request, reply): Promise<ProfileEntity> {
			const { userId } = request.body;
			const user = await this.db.users.findOne({ key: 'id', equals: userId });
			const checkProfile = await this.db.profiles.findOne({ key: 'userId', equals: userId });
			const memberTypes = ['basic', 'business'];

			if (!user) {
				return reply.status(404).send({ message: Constants.USER_ERROR });
			}

			const newProfile = (await this.db.profiles.create(request.body)) || {};

			if (checkProfile || !newProfile.id || !memberTypes.includes(newProfile.memberTypeId)) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			return reply.send(newProfile);
		}
	);

	// fastify.delete(
	// 	'/:id',
	// 	{
	// 		schema: {
	// 			params: idParamSchema,
	// 		},
	// 	},
	// 	async function (request, reply): Promise<ProfileEntity> {}
	// );

	fastify.patch(
		'/:id',
		{
			schema: {
				body: changeProfileBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<ProfileEntity> {
			const { id } = request.params;
			const { body } = request;
			const profile = await this.db.profiles.findOne({ key: 'id', equals: id });

			if (!profile) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const updatedProfile = await this.db.profiles.change(id, body);

			return reply.send(updatedProfile);
		}
	);
};

export default plugin;
