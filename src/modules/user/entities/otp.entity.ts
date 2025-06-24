import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityEnum.OTP)
export class OtpEntity extends BaseEntity {
  @Column()
  code: string;
  @Column()
  expiresIn: Date;
  @Column()
  userId: number;
  @OneToOne(()=>UserEntity,user=>user.otp ,{onDelete:"CASCADE"})
  user:UserEntity

}
