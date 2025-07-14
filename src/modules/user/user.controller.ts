import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  UseGuards,
  Res,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from "@nestjs/swagger";
import { ProfileDto } from "./dto/profile.dto";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
  multerDestination,
  multerFilename,
  multerStorage,
} from "src/common/utils/multer.util";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ProfileImage } from "./types/files";
import {
  changeEmailDto,
  changePhoneDto,
  changeUsernameDto,
} from "./entities/profile.entity";
import { Response } from "express";
import { CookieKeys } from "../auth/enums/cookie.enum";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { AuthMessage, PublicMessage } from "src/common/enum/message.enum";
import { CheckOtpDto } from "../auth/dto/basic.dto";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

@Controller("user")
@ApiTags("User")
@AuthDecorator()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get("follow/:followingId")
  @ApiParam({ name: "followingId" })
  follow(@Param("followingId", ParseIntPipe) followingId: number) {
    return this.userService.followToggle(followingId);
  }
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }
  @Get("followers")
  @Pagination()
  followers(@Query() paginationDto: PaginationDto) {
    return this.userService.followerList(paginationDto);
  }
  @Get("followers")
  @Pagination()
  following(@Query() paginationDto: PaginationDto) {
    return this.userService.followingList(paginationDto);
  }
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
  @Put("profile")
  @ApiConsumes(SwaggerConsumes.MultipartData)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image_profile", maxCount: 1 },
        { name: "bg_image", maxCount: 1 },
      ],
      {
        storage: multerStorage("user-profile"),
      }
    )
  )
  changeProfile(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [],
      })
    )
    files: ProfileImage,
    @Body() profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }
  @Get("profile")
  profile() {
    return this.userService.profile();
  }
  @Patch("change-email")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: changeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.EmailOTP, token, CookieOptionsToken());
    res.json({
      code,
      message: AuthMessage.SentOtp,
    });
  }
  @Post("verify-email-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async varifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }
  @Patch("change-phone")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: changePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      phoneDto.phone
    );
    if (message) return res.json({ message });
    res.cookie(CookieKeys.PhoneOTP, token, CookieOptionsToken());
    res.json({
      code,
      message: AuthMessage.SentOtp,
    });
  }
  @Post("verify-phone-otp")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async varifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }
  @Patch("change-username")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(
    @Body() usernameDto: changeUsernameDto,
    @Res() res: Response
  ) {
    return this.userService.changeUsername(usernameDto.username);
  }
}
