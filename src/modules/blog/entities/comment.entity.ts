import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, Entity, IsNull, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityEnum.BlogComment)
export class BlogCommentEntity extends BaseEntity {
  @Column()
  text: string;
  @Column({ default: false })
  accepted: boolean;
  @Column()
  blogId: number;
  @Column()
  userId: number;
  @Column({ nullable: true })
  parentId: number|null;
  @ManyToOne(() => BlogEntity, (blog) => blog.comment, { onDelete: "CASCADE" })
  blog: BlogEntity;
  @ManyToOne(() => UserEntity, (user) => user.blog_comments, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
  @ManyToOne(() => BlogCommentEntity, (parent) => parent.children, {
    onDelete: "CASCADE",
  })
  parent: BlogCommentEntity;
  @OneToMany(() => BlogCommentEntity, (comment) => comment.parent)
  @JoinColumn({ name: "parent" })
  children: BlogCommentEntity;
}
