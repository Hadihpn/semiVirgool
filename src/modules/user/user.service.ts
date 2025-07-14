import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
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
import {
  AuthMessage,
  ConflictMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enum/message.enum";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";
import { OtpEntity } from "./entities/otp.entity";
import { CookieKeys } from "../auth/enums/cookie.enum";
import { AuthMethod } from "../auth/enums/method.enum";
import { FollowEntity } from "./entities/follow.entity";
import { EntityEnum } from "src/common/enum/entity.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService
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
    if (files?.image_profile?.length > 0) {
      let [image] = files?.image_profile;
      profileDto.image_profile = image?.path?.slice(7);
    }
    if (files?.bg_image?.length > 0) {
      let [image] = files?.bg_image;
      profileDto.bg_image = image?.path?.slice(7);
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
  profile() {
    const { id } = this.request.user!;
    return this.userRepository.createQueryBuilder(EntityEnum.USER)
    .where({id})
    .leftJoinAndSelect("user.profile","profile")
    .loadRelationCountAndMap("user.followers","user.followers")
    .loadRelationCountAndMap("user.following","user.following")
    .getOne()
  }
  async changeEmail(email: string) {
    const { id } = this.request.user!;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Email);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    user.new_email = email;
    const otp = await this.authService.saveOtp(user.id, AuthMethod.Email);
    const token = await this.tokenService.createEmailToken({ email });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user!;
    const otp = await this.checkOtp(userId, code, AuthMethod.Email);
    const token = this.request.cookies?.[CookieKeys.EmailOTP];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { email } = await this.tokenService.verifyEmailToken(token);
    if (!email || email != new_email)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    await this.userRepository.update(
      { id: userId },
      {
        email,
        new_email: undefined,
        varified_email: true,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }
  async changePhone(phone: string) {
    const { id } = this.request.user!;
    const user = await this.userRepository.findOneBy({ phone });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Phone);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    user.new_phone = phone;
    const otp = await this.authService.saveOtp(user.id, AuthMethod.Phone);
    const token = await this.tokenService.createPhoneToken({ phone });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user!;
    const otp = await this.checkOtp(userId, code, AuthMethod.Phone);
    const token = this.request.cookies?.[CookieKeys.PhoneOTP];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { phone } = await this.tokenService.verifyPhoneToken(token);
    if (!phone || phone != new_phone)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    await this.userRepository.update(
      { id: userId },
      {
        phone,
        new_phone: undefined,
        varified_phone: true,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }

  async checkOtp(userId: number, code: string, method) {
    const otp = await this.otpRepository.findOneBy({ userId, method });
    if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    return otp;
  }
  async changeUsername(username: string) {
    const { id } = this.request.user!;
    const user = await this.userRepository.findOneBy({ user_name: username });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Username);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update(
      { id },
      {
        user_name: username,
      }
    );
  }
  async followToggle(followingId: number) {
    const userId = this.request.user?.id;
    const following = await this.userRepository.findOneBy({ id: followingId });
    if (!following) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    const isFollowed = await this.followRepository.findOneBy({
      followingId,
      followerId: userId,
    });
    let message = PublicMessage.Follow;
    if (isFollowed) {
      message = PublicMessage.UnFollow;
      await this.followRepository.remove(isFollowed);
    } else {
      await this.followRepository.insert({ followingId, followerId: userId });
    }
    return {
      message,
    };
  }
}
