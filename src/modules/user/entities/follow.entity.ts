import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityEnum.Follow)
export class FollowEntity extends BaseEntity {
  @Column()
  followingId: number;
  @Column()
  followerId: number;
  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: "CASCADE",
  })
  following: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.following, {
    onDelete: "CASCADE",
  })
  follower: UserEntity;
  @CreateDateColumn()
  created_at: Date;
}
