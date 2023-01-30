import { Constants } from './../../utils/constants';
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { changeMemberTypeBodySchema } from './schema';
import type { MemberTypeEntity } from '../../utils/DB/entities/DBMemberTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
	fastify
): Promise<void> => {
	fastify.get('/', async function (request, reply): Promise<
		MemberTypeEntity[]
	> {
		return reply.send(this.db.memberTypes);
	});

	fastify.get(
		'/:id',
		{
			schema: {
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<MemberTypeEntity> {
			const { id } = request.params;

			const memberType = await this.db.memberTypes.findOne({
				key: 'id',
				equals: id,
			});

			if (!memberType) {
				return reply.status(404).send({ message: Constants.MEMBER_TYPE_ERROR });
			}

			return reply.send(memberType);
		}
	);

	fastify.patch(
		'/:id',
		{
			schema: {
				body: changeMemberTypeBodySchema,
				params: idParamSchema,
			},
		},
		async function (request, reply): Promise<MemberTypeEntity> {
			const { id } = request.params;
			const { body } = request;

			const memberType = await this.db.memberTypes.findOne({
				key: 'id',
				equals: id,
			});

			if (!memberType) {
				return reply.status(400).send({ message: Constants.BAD_REQUEST });
			}

			const updatedPost = await this.db.memberTypes.change(id, body);

			return reply.send(updatedPost);
		}
	);
};

export default plugin;
