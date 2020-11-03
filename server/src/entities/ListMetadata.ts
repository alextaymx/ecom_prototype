import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class ListMetadata {
  @Field()
  count: number;
}
