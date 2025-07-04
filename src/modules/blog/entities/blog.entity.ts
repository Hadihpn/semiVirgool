import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity, ManyToOne } from "typeorm";
import { BlogStatusEnum } from "../enum/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityEnum.Blog)
export class BlogEntity extends BaseEntity {
  @Column()
  title: string;
  @Column()
  description: string;
  @Column()
  content: string;
  @Column({ default: BlogStatusEnum.Draft })
  status: string;
  @Column({ nullable: true })
  image: string;
  @Column()
  authorId: number;
  @ManyToOne(()=>UserEntity,user=>user.blogs,{onDelete:"CASCADE"})
  author:UserEntity
  @CreateDateColumn()
  created_at: Date;
  @CreateDateColumn()
  updated_at: Date;
}
