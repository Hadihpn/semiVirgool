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
import { AuthRespone } from "./types/auth_respone";
import { CookieKeys } from "./enums/cookie.enum";
import { REQUEST } from "@nestjs/core";

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private OtpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService
  ) {}
  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;
    let result;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        console.log("resulst is", result);
        return this.sendResponse(res, result);
      case AuthType.Register:
        console.log("type is:", type);
        result = await this.register(method, username);
        console.log("resulst is", result);
        return this.sendResponse(res, result);
      default:
        throw new UnauthorizedException(`type ${type} is not valid`);
        break;
    }
  }
  async sendResponse(res: Response, result: AuthRespone) {
    const { code, token } = result;
    res.cookie(CookieKeys.OTP, token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 2),
    });
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
    console.log("user is ", user);

    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.saveOtp(user.id);
    const token = await this.tokenService.createOtpToken({ userId: user.id });
    console.log("otp is :", otp);
    console.log("token is :", token);
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
    console.log("user is :", user);

    user.user_name = `m_${user.id}`;
    await this.userRepository.save(user);
    const otp = await this.saveOtp(user.id);
    const token = await this.tokenService.createOtpToken({ userId: user.id });
    console.log("otp is :", otp);
    console.log("token is :", token);
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
    const token = this.request.cookies?.[CookieKeys.OTP];
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);
    const { userId } = await this.tokenService.verifyOtpToken(token);
    if (!userId) throw new UnauthorizedException(AuthMessage.NotFoundAccount);
    const otp = await this.OtpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain);
    const now = new Date();
    if (otp.expiresIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.TryAgain);
    const accessToken = await this.tokenService.createAccessToken({ userId });
    return {
      message: PublicMessage.LoggedIn,
      accessToken
    };
    return token;
  }
  async saveOtp(userId: number) {
    const code = randomInt(10000, 99999).toString();
    const now = new Date();
    const expiresIn = new Date(now.getTime() + 1000 * 60 * 2);
    let otp = await this.OtpRepository.findOneBy({ userId });
    if (otp) {
      console.log;
      if (otp.expiresIn > now)
        throw new BadRequestException(AuthMessage.OtpIsValid);
      otp.code = code;
      otp.expiresIn = expiresIn;
    } else {
      otp = await this.OtpRepository.create({
        code: code,
        expiresIn: expiresIn,
        userId: userId,
      });
    }
    await this.OtpRepository.save(otp);
    await this.userRepository.update(
      { id: userId },
      {
        otpId: otp.id,
      }
    );
    return otp;
  }
  async validateAccessToken(token){
    const {userId} = this.tokenService.verifyAccessToken(token);
    const user = await this.userRepository.findOneBy({id:userId});
    if(!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    return user;
  }
}
