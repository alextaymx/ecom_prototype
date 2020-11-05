import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class ListMetadata {
  @Field()
  count: number;
}

// @ObjectType()
// export class PermissionObject {
//   @Field()
//   id: string;
// }
