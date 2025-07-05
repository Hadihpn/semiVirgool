import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
@Entity(EntityEnum.BlogLike)
export class BlogLikeEntity extends BaseEntity{
@Column()
blogId:number;
@Column()
userId:number;
@ManyToOne(()=>BlogEntity,blog=>blog.likes,{onDelete:"CASCADE"})
blog:BlogEntity
@ManyToOne(()=>UserEntity,user=>user.blog_likes,{onDelete:"CASCADE"})
user:UserEntity
}