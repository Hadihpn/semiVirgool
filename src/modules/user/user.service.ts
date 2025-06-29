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
  async changeProfile(files: any, profileDto: ProfileDto) {
    const { id: userId, profileId } = this.request.user!;
    if(files?.image_profile?.length>0){
      let [image] = files?.image_profile;
      profileDto.image_profile = image
    }
    if(files?.bg_image?.length>0){
      let [image] = files?.bg_image;
      profileDto.bg_image = image
    }
    // Filter out undefined/null values from DTO
    const updateData = Object.fromEntries(
      Object.entries(profileDto).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );
    let profile = await this.profileRepository.findOneBy({ userId });
    if (profile) {
      // Update existing profile
      Object.assign(profile, updateData);
    } else {
      // Create new profile
      profile = this.profileRepository.create({ ...updateData, userId });
    }
    profile = await this.profileRepository.save(profile);
    // Update user's profileId if not set
    if (!profileId) {
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id }
      );
    }

    return profile;
  }
}
