import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne } from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
@Entity(EntityEnum.USER)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  user_name: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ nullable: true })
  password: string;
  @Column({ nullable: true })
  otpId: number;
  @OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: OtpEntity;
  @Column({ nullable: true })
  profileId: number;
  @OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
  @JoinColumn() 
  profile: ProfileEntity;
  @CreateDateColumn()
  created_at: Date;
  @CreateDateColumn()
  updated_at: Date;
}
