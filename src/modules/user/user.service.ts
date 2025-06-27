import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { ProfileDto } from "./dto/profile.dto";
import { Request } from "express";
import { isDate } from "class-validator";
import { GenderEnum } from "./enum/gender.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  create(createUserDto: CreateUserDto) {
    return "This action adds a new user";
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
  async changeProfile(profileDto: ProfileDto) {
    // AuthGuard ensures user is always present, so we can safely assert
    const { id: userId, profileId } = this.request.user!;
    let profile = await this.profileRepository.findOneBy({ userId });
    if (profile) {
      const {nick_name,bio,birtdate,gender,linkdin_profile} = profileDto
      if(nick_name) profile.nick_name = nick_name;
      if(bio) profile.bio = bio; 
      if(birtdate && isDate(new Date(birtdate))) profile.birtdate = birtdate;
      if(gender && Object.values(GenderEnum as any).includes(gender)) profile.gender = gender;
      if(linkdin_profile) profile.linkdin_profile = linkdin_profile;
    } else {
      profile = await this.profileRepository.create({...profileDto,userId});
    }
    profile = await this.profileRepository.save(profile!);
    if (!profileId) {
      await this.userRepository.update(
        { id: userId },
        { profileId: profile?.id }
      );
    }
    // Add your profile update logic here
    return profile;
  }
}
