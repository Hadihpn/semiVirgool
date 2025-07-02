import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity, OneToOne } from "typeorm";
import { UserEntity } from "./user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsMobilePhone, IsPhoneNumber } from "class-validator";
import { ValidationMessage } from "src/common/enum/message.enum";

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
  @Column({ nullable: true })
  birtdate: Date;
  @Column({ nullable: true })
  linkdin_profile: string;
  @Column({ nullable: true })
  userId: number;
  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: "CASCADE",
  })
  user: UserEntity;
}

export class changeEmailDto {
  @ApiProperty()
  @IsEmail({},{message:ValidationMessage.InavalidEmailFormat})
  email: string;
}
export class changePhoneDto {
  @ApiProperty()
  @IsMobilePhone("fa-IR",{},{message:ValidationMessage.InavalidEmailFormat})
  phone: string;
}
