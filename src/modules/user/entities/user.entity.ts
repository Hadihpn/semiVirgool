import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { OtpEntity } from "./otp.entity";
import { ProfileEntity } from "./profile.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";
import { BlogLikeEntity } from "src/modules/blog/entities/like.enitity";
import { BlogBookmarkEntity } from "src/modules/blog/entities/bookmark.enitity";
@Entity(EntityEnum.USER)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  user_name: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ unique: true, nullable: true })
  new_email: string;
  @Column({ unique: true, nullable: true })
  new_phone: string;
  @Column({ unique: true, nullable: false })
  varified_email: boolean;
  @Column({ unique: true, nullable: false })
  varified_phone: boolean;
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
  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];
  @OneToMany(() => BlogLikeEntity, (like) => like.user)
  blog_likes: BlogLikeEntity[];
  @OneToMany(()=>BlogBookmarkEntity,bookmark=>bookmark.user)
  blog_bookmarks:BlogBookmarkEntity[];
  @CreateDateColumn()
  created_at: Date;
  @CreateDateColumn()
  updated_at: Date;
}
