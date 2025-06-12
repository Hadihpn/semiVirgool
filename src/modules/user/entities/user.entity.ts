import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity } from "typeorm";
@Entity(EntityEnum.USER)
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  user_name: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({nullable:true})
  password: string;
  @CreateDateColumn()
  created_at: Date;
  @CreateDateColumn()
  updated_at: Date;
}
