import { InputType, Field } from "type-graphql";
@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;
  @Field()
  name: string;
  @Field()
  password: string;
}

@InputType()
export class UserFilter {
  @Field({ nullable: true })
  id: string;
  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  password: string;
  @Field({ nullable: true })
  is_published: boolean;
}
