import { EntityEnum } from "src/common/enum/entity.enum";
import { BaseEntity, Column, Entity } from "typeorm";

@Entity(EntityEnum.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;
  @Column({ nullable: true })
  priority: number;
}
