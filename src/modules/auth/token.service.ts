import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  AccessTokenPaylaod,
  CookiePaylaod,
  EmailTokenPaylaod,
  PhoneTokenPaylaod,
} from "./types/payload";
import { AuthMessage } from "src/common/enum/message.enum";

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}
  createOtpToken(payload: CookiePaylaod) {
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
  createEmailToken(payload: EmailTokenPaylaod) {
    return this.jwtService.sign(payload, {
      secret: process.env.EMAIL_TOKEN_SECRET,
      expiresIn: "1y",
    });
  }
  verifyEmailToken(token: string): EmailTokenPaylaod {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.EMAIL_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException(AuthMessage.TryAgain);
    }
  }
  createPhoneToken(payload: PhoneTokenPaylaod) {
    return this.jwtService.sign(payload, {
      secret: process.env.PHONE_TOKEN_SECRET,
      expiresIn: "1y",
    });
  }
  verifyPhoneToken(token: string): PhoneTokenPaylaod {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PHONE_TOKEN_SECRET,
      });
    } catch (error) {
      throw new BadRequestException(AuthMessage.TryAgain);
    }
  }
}
