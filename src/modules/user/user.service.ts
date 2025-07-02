import { ConflictException, Inject, Injectable, Scope, UnauthorizedException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { ProfileDto } from "./dto/profile.dto";
import { Request } from "express";
import { ProfileImage } from "./types/files";
import { AuthMessage, ConflictMessage, PublicMessage } from "src/common/enum/message.enum";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
    private authService :AuthService,
    private tokenervice  : TokenService    
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
  async changeProfile(files: ProfileImage, profileDto: ProfileDto) {
    const { id: userId, profileId } = this.request.user!;
    if(files?.image_profile?.length>0){
      let [image] = files?.image_profile;
      profileDto.image_profile = image?.path?.slice(7)
    }
    if(files?.bg_image?.length>0){
      let [image] = files?.bg_image;
      profileDto.bg_image = image?.path?.slice(7)
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
  profile(){
    const{id}=this.request.user!;
    return this.userRepository.findOne({
      where:{id},
      relations:["profile"]
    })
  }
  async changeEmail(email:string){
    const {id} = this.request.user!;
    const user = await this.userRepository.findOneBy({email});
    if(!user) throw new UnauthorizedException(AuthMessage.LoginAgain)
    if(user && user?.id!== id) {throw new ConflictException(ConflictMessage.Email) }
    else if(user && user.id == id){
      return {
        message:PublicMessage.Updated
      }
    }
    user.new_email= email;
    const otp = await this.authService.saveOtp(user.id);
    const token = await this.tokenervice.createEmailToken({email})
    return {
      code:otp.code,
      token
    }
  }
}
