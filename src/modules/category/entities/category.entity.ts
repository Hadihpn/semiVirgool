import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { BlogCategoryEntity } from "src/modules/blog/entities/blog-category.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity(EntityEnum.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  slug: string;
  @Column({ nullable: true })
  priority: number;
  @OneToMany(()=>BlogCategoryEntity,blogCategory=>blogCategory.category)
  blog_categories:BlogCategoryEntity[]
}
