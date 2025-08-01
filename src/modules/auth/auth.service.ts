import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto, CheckOtpDto } from "./dto/basic.dto";
import { AuthType } from "./enums/type.enum";
import { AuthMethod } from "./enums/method.enum";
import { isEmail, isMobilePhone } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { ProfileEntity } from "../user/entities/profile.entity";
import { Repository } from "typeorm";
import {
  AuthMessage,
  BadRequestMessage,
  PublicMessage,
} from "src/common/enum/message.enum";
import { OtpEntity } from "../user/entities/otp.entity";
import { randomInt } from "crypto";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import { TokenService } from "./token.service";
import { Request, Response } from "express";
import { AuthRespone, GoogleUser } from "./types/auth_respone";
import { CookieKeys } from "./enums/cookie.enum";
import { REQUEST } from "@nestjs/core";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { randomId } from "src/common/utils/function.util";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService
  ) {}
  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(res, result);
      default:
        throw new UnauthorizedException(`type ${type} is not valid`);
        break;
    }
  }
  async sendResponse(res: Response, result: AuthRespone) {
    const { code, token } = result;
    res.cookie(CookieKeys.OTP, token, CookieOptionsToken());
    res.json({
      message: AuthMessage.SentOtp,
      code,
    });
  }
  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity | null = await this.checkExistUser(
      method,
      validUsername
    );
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.saveOtp(user.id,method);
    const token = await this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }
  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);
    let user: UserEntity | null = await this.checkExistUser(
      method,
      validUsername
    );
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);
    if (method === AuthMethod.Username)
      throw new BadRequestException(BadRequestMessage.InValidRegisterData);
    user = this.userRepository.create({
      [method]: username,
    });
    await this.userRepository.save(user);
    user.user_name = `m_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.saveOtp(user.id,method);
    const token = await this.tokenService.createOtpToken({ userId: user.id });
    return {
      token,
      code: otp.code,
    };
  }
  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity | null;
    if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({ user_name: username });
    } else {
      throw new BadRequestException(BadRequestMessage.InValidLoginData);
    }
    return user;
  }
  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException("email format is not valid   ");
      case AuthMethod.Phone:
        if (isMobilePhone(username, "fa-IR")) return username;
        throw new BadRequestException("phone number  is not valid");
      case AuthMethod.Username:
        return username;
      default:
        throw new UnauthorizedException("userName is not valid");
    }
  }
  async checkOtp(code: string) {
    console.log(code);
    
    const token = this.request.cookies?.[CookieKeys.OTP];
    console.log(token);
    
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { userId } = await this.tokenService.verifyOtpToken(token);
    console.log(userId);
    
    if (!userId) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.otpRepository.findOneBy({ userId });
    console.log(otp);
    
    if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    const accessToken = await this.tokenService.createAccessToken({ userId });
    if (otp.method === AuthMethod.Email) {
      await this.userRepository.update(
        { id: userId },
        {
          varified_email : true,
        }
      );
    }else if(otp.method === AuthMethod.Phone){
      await this.userRepository.update(
        { id: userId },
        {
          varified_phone : true,
        }
      );
    }
    return {
      message: PublicMessage.LoggedIn,
      accessToken,
    };
    return token;
  }
  async saveOtp(userId: number,method:AuthMethod) {
    const code = randomInt(10000, 99999).toString();
    const now = new Date();
    const expiresIn = new Date(now.getTime() + 1000 * 60 * 2);
    let otp = await this.otpRepository.findOneBy({ userId,method });
    if (otp) {
      if (otp.expiresIn > now)
        throw new BadRequestException(AuthMessage.OtpIsValid);
      otp.code = code;
      otp.method = method;
      otp.expiresIn = expiresIn;
    } else {
      otp = await this.otpRepository.create({
        code: code,
        expiresIn: expiresIn,
        userId: userId,
        method
      });
    }
    console.log("otp");
    console.log(otp);
    
    await this.otpRepository.save(otp);
    await this.userRepository.update(
      { id: userId },
      {
        otpId: otp.id,
      }
    );
    return otp;
  }
  async validateAccessToken(token) {
    const { userId } = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }
   async googleAuth(userData: GoogleUser) {
        const {email, firstName, lastName} = userData;
        let token: string;
        let user = await this.userRepository.findOneBy({email});
        if(user) {
            token = this.tokenService.createOtpToken({ userId: user.id });
        }else {
            user = this.userRepository.create({
                email,
                varified_email: true,
                user_name: email.split("@")['0'] + randomId(),
            });
            user = await this.userRepository.save(user);
            let profile = this.profileRepository.create({
                userId: user.id,
                nick_name: `${firstName} ${lastName}`,
            });
            profile = await this.profileRepository.save(profile);
            user.profileId = profile.id;
            await this.userRepository.save(user);
            token = this.tokenService.createAccessToken({userId: user.id})
        }
        return {
            token
        }
    }
}
