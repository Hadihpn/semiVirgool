import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { BlogEntity } from "./blog.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { EntityEnum } from "src/common/enum/entity.enum";

@Entity(EntityEnum.BlogCategory)
export class BlogCategoryEntity extends BaseEntity {
    @Column()
    blogId:number
    @Column()
    categoryId:number
    @ManyToOne(()=>BlogEntity,blog=>blog.categories,{onDelete:"CASCADE"})
    blog:BlogEntity
    @ManyToOne(()=>CategoryEntity,category=>category.blog_categories,{onDelete:"CASCADE"})
    category:CategoryEntity
}