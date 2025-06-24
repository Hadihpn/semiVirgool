import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPaylaod, CookiePaylaod } from "./types/payload";
import { AuthMessage } from "src/common/enum/message.enum";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}
  createOtpToken(payload: CookiePaylaod) {
    console.log("payload is :", payload);
    const token = this.jwtService.sign(payload, {
      secret: process.env.OTP_TOKEN_SECRET,
      expiresIn: 60 * 2,
    });
    return token;
  }
  verifyOtpToken(token: string): CookiePaylaod {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.OTP_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.ExpiredCode);
    }
  }
  createAccessToken(payload: AccessTokenPaylaod) {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: "1y",
    });
  }
  verifyAccessToken(token: string): AccessTokenPaylaod {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.TryAgain);
    }
  }
}
