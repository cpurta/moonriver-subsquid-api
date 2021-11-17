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
  TokenMintCreateInput,
  TokenMintCreateManyArgs,
  TokenMintUpdateArgs,
  TokenMintWhereArgs,
  TokenMintWhereInput,
  TokenMintWhereUniqueInput,
  TokenMintOrderByEnum,
} from '../../warthog';

import { TokenMint } from './token-mint.model';
import { TokenMintService } from './token-mint.service';

@ObjectType()
export class TokenMintEdge {
  @Field(() => TokenMint, { nullable: false })
  node!: TokenMint;

  @Field(() => String, { nullable: false })
  cursor!: string;
}

@ObjectType()
export class TokenMintConnection {
  @Field(() => Int, { nullable: false })
  totalCount!: number;

  @Field(() => [TokenMintEdge], { nullable: false })
  edges!: TokenMintEdge[];

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
export class TokenMintConnectionWhereArgs extends ConnectionPageInputOptions {
  @Field(() => TokenMintWhereInput, { nullable: true })
  where?: TokenMintWhereInput;

  @Field(() => TokenMintOrderByEnum, { nullable: true })
  orderBy?: [TokenMintOrderByEnum];
}

@Resolver(TokenMint)
export class TokenMintResolver {
  constructor(@Inject('TokenMintService') public readonly service: TokenMintService) {}

  @Query(() => [TokenMint])
  async tokenMints(
    @Args() { where, orderBy, limit, offset }: TokenMintWhereArgs,
    @Fields() fields: string[]
  ): Promise<TokenMint[]> {
    return this.service.find<TokenMintWhereInput>(where, orderBy, limit, offset, fields);
  }

  @Query(() => TokenMint, { nullable: true })
  async tokenMintByUniqueInput(
    @Arg('where') where: TokenMintWhereUniqueInput,
    @Fields() fields: string[]
  ): Promise<TokenMint | null> {
    const result = await this.service.find(where, undefined, 1, 0, fields);
    return result && result.length >= 1 ? result[0] : null;
  }

  @Query(() => TokenMintConnection)
  async tokenMintsConnection(
    @Args() { where, orderBy, ...pageOptions }: TokenMintConnectionWhereArgs,
    @Info() info: any
  ): Promise<TokenMintConnection> {
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
      result = await this.service.findConnection<TokenMintWhereInput>(where, orderBy, pageOptions, rawFields);
    } catch (err: any) {
      console.log(err);
      // TODO: should continue to return this on `Error: Items is empty` or throw the error
      if (!(err.message as string).includes('Items is empty')) throw err;
    }

    return result as Promise<TokenMintConnection>;
  }
}
