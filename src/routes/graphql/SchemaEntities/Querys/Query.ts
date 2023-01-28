import fetch from 'node-fetch';
import {
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import { MemberType, PostType, ProfileType, UserType } from './QueryDefs';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../../../utils/DB/entities/DBMemberTypes';
import { routeUrl } from '../../config';
import { CTX } from '../..';

export const Query = new GraphQLObjectType({
	name: 'Query',
	fields: {
		users: {
			type: new GraphQLList(UserType),
			async resolve(): Promise<UserEntity[]> {
				const response = await fetch(routeUrl.users);
				const users: { entities: UserEntity[] } = await response.json();
				return users.entities;
			},
		},
		user: {
			type: UserType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>, ctx: CTX) {
				const user = await ctx.users.load(args.id);
				return user[0];
			},
		},
		profiles: {
			type: new GraphQLList(ProfileType),
			async resolve() {
				const response = await fetch(routeUrl.profiles);
				const profiles: { entities: ProfileEntity[] } = await response.json();
				return profiles.entities;
			},
		},
		profile: {
			type: ProfileType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>, ctx: CTX) {
				const profile = await ctx.profiles.load(args.id);
				return profile[0];
			},
		},
		posts: {
			type: new GraphQLList(PostType),
			async resolve() {
				const response = await fetch(routeUrl.posts);
				const posts: { entities: PostEntity[] } = await response.json();
				return posts.entities;
			},
		},
		post: {
			type: PostType,
			args: { id: { type: GraphQLID } },
			async resolve(parent: UserEntity, args: Record<'id', string>, ctx: CTX) {
				const post = await ctx.posts.load(args.id);
				return post[0];
			},
		},
		memberTypes: {
			type: new GraphQLList(MemberType),
			async resolve() {
				const response = await fetch(routeUrl.memberTypes);
				const memberTypes: { entities: MemberTypeEntity[] } =
					await response.json();
				return memberTypes.entities;
			},
		},
		memberType: {
			type: MemberType,
			args: { id: { type: GraphQLString } },
			async resolve(parent: UserEntity, args: Record<'id', string>, ctx: CTX) {
				const type = await ctx.memberType.load(args.id);
				return type[0];
			},
		},
	},
});
