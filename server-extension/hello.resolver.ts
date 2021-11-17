import {Resolver, ObjectType, Field, Query} from "type-graphql"
import {InjectManager} from "typeorm-typedi-extensions"
import {EntityManager} from "typeorm"
import {TokenBurn,TokenMint} from "../generated/model"


@ObjectType()
export class Hello {
  @Field(() => String, { nullable: false })
  greeting!: string

  constructor(greeting: string) {
    this.greeting = greeting
  }
}


@Resolver()
export class HelloResolver {
  constructor(
    @InjectManager() private db: EntityManager
  ) {}

  @Query(() => Hello)
  async hello(): Promise<Hello> {
    let burnCount = await this.db.getRepository(TokenBurn).count()
    let mintCount = await this.db.getRepository(TokenMint).count()

    return new Hello(`Hello, we've seen ${burnCount} token burn events, and ${mintCount} mint events on the Moonriver network`)
  }
}