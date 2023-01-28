import fetch from 'node-fetch';
import {
	GraphQLID,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from 'graphql';
import {
	MemberType,
	PostType,
	ProfileType,
	UserType,
	UsersWithFollowersType,
} from './QueryDefs';
import { UserEntity } from '../../../../utils/DB/entities/DBUsers';
import { ProfileEntity } from '../../../../utils/DB/entities/DBProfiles';
import { PostEntity } from '../../../../utils/DB/entities/DBPosts';
import { MemberTypeEntity } from '../../../../utils/DB/entities/DBMemberTypes';
import { routeUrl } from '../../config';

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
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.users}/${args.id}`);

				return await response.json();
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
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.profiles}/${args.id}`);

				return await response.json();
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
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.posts}/${args.id}`);

				return await response.json();
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
			async resolve(parent: UserEntity, args: Record<'id', string>) {
				const response = await fetch(`${routeUrl.memberTypes}/${args.id}`);

				return await response.json();
			},
		},
		getUsersWithFollowers: {
			type: UsersWithFollowersType,
			async resolve(parent: UserEntity, args: unknown) {
				const response = await fetch(`${routeUrl.users}`);
				const users: { entities: UserEntity[] } = await response.json();
				const subscribers = users.entities.filter((subscriber) =>
					subscriber.subscribedToUserIds.includes(parent.id)
				);
				return subscribers;
			},
		},
	},
});
