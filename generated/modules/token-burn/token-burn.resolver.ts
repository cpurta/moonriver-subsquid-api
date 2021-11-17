import {
  Arg,
  Args,
  Mutation,
  Query,
  Root,
  Resolver,
  FieldResolver,
  ObjectType,
  Field,
  Int,
  ArgsType,
  Info,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { Inject } from 'typedi';
import { Min } from 'class-validator';
import {
  Fields,
  StandardDeleteResponse,
  UserId,
  PageInfo,
  RawFields,
  NestedFields,
  BaseContext,
} from '@subsquid/warthog';

import {
  TokenBurnCreateInput,
  TokenBurnCreateManyArgs,
  TokenBurnUpdateArgs,
  TokenBurnWhereArgs,
  TokenBurnWhereInput,
  TokenBurnWhereUniqueInput,
  TokenBurnOrderByEnum,
} from '../../warthog';

import { TokenBurn } from './token-burn.model';
import { TokenBurnService } from './token-burn.service';

@ObjectType()
export class TokenBurnEdge {
  @Field(() => TokenBurn, { nullable: false })
  node!: TokenBurn;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class TokenBurnConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [TokenBurnEdge], { nullable: false })
  edges!: TokenBurnEdge[];

  @Field(() => PageInfo, { nullable: false })
  pageInfo!: PageInfo;
}

@ArgsType()
export class ConnectionPageInputOptions {
  @Field(() => Int, { nullable: true })
  @Min(0)
  first?: number;

  @Field(() => String, { nullable: true })
  after?: string; // V3: TODO: should we make a RelayCursor scalar?

  @Field(() => Int, { nullable: true })
  @Min(0)
  last?: number;

  @Field(() => String, { nullable: true })
  before?: string;
}

@ArgsType()
export class TokenBurnConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => TokenBurnWhereInput, { nullable: true })
  where?: TokenBurnWhereInput;

  @Field(() => TokenBurnOrderByEnum, { nullable: true })
  orderBy?: [TokenBurnOrderByEnum];
}

@Resolver(TokenBurn)
export class TokenBurnResolver {
  constructor(@Inject('TokenBurnService') public readonly service: TokenBurnService) {}

  @Query(() => [TokenBurn])
  async tokenBurns(
    @Args() { where, orderBy, limit, offset }: TokenBurnWhereArgs,
    @Fields() fields: string[]
  ): Promise<TokenBurn[]> {
    return this.service.find<TokenBurnWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => TokenBurn, { nullable: true })
  async tokenBurnByUniqueInput(
    @Arg('where') where: TokenBurnWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<TokenBurn | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => TokenBurnConnection)
  async tokenBurnsConnection(
    @Args() { where, orderBy, ...pageOptions }: TokenBurnConnectionWhereArgs,
    @Info() info: any
  ): Promise<TokenBurnConnection> {
    const rawFields = graphqlFields(info, {}, { excludedFields: ['__typename'] });

    let result: any = {
      totalCount: 0,
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    // If the related database table does not have any records then an error is thrown to the client
    // by warthog
    try {
      result = await this.service.findConnection<TokenBurnWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<TokenBurnConnection>;
  }
}
