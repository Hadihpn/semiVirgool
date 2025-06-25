import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, CheckOtpDto } from "./dto/basic.dto";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { Request, Response } from "express";
import { AuthGuard } from "./guards/auth.guard";

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
  @Get("check-login")
  @UseGuards(AuthGuard)
  @ApiBearerAuth("Authorization")
  checkLogin(@Req() req:Request){
    return req.user
  }
}
