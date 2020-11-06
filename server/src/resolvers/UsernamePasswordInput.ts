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
  q: string;
  @Field({ nullable: true })
  id: string;
  @Field({ nullable: true })
  name: string;
  @Field({ nullable: true })
  email: string;
  @Field({ nullable: true })
  status: string;
  @Field({ nullable: true })
  role: string;
  @Field({ nullable: true })
  createdAt: Date;
}
