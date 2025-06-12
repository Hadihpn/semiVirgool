import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity } from "typeorm";

@Entity(EntityEnum.PROFILE)
export class ProfileEntity extends BaseEntity {
  @Column()
  nick_name: string;
  @Column({ nullable: true })
  bio: string;
  @Column({ nullable: true })
  image_profile: string;
  @Column({ nullable: true })
  bg_image: string;
  @Column({ nullable: true })
  gender: string;
  @Column({nullable:true})
  birtdate: Date;
  @Column({nullable:true})
  linkdin_profile: string;
}
