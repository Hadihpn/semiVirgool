import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, CheckOtpDto } from "./dto/basic.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("user-existence")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }
   @Post("check-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  checkOtp(@Body() checkOtp: CheckOtpDto) {
    return this.authService.checkOtp(checkOtp.code);
  }
}
