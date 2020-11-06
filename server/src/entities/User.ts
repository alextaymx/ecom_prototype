import { ObjectType, Field } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
} from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @Column()
  status!: string;

  @Field()
  @Column()
  role!: string;

  @Field(() => [String])
  @Column("text", { array: true })
  permissions!: string[];

  @Field(() => Date)
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
