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
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
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
import { changeEmailDto } from "./entities/profile.entity";
import { Response } from "express";
import { CookieKeys } from "../auth/enums/cookie.enum";
import { CookieOptionsToken } from "src/common/utils/cookie.util";
import { AuthMessage, PublicMessage } from "src/common/enum/message.enum";

@Controller("user")
@ApiTags("User")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
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

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
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
        storage: multerStorage("user-profile")
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
  profile(){
    return this.userService.profile();
  }
  @Patch("change-email")
  async changeEmail(@Body() emailDto:changeEmailDto, @Res() res:Response   ){
    const {code,token,message}= await this.userService.changeEmail(emailDto.email)
    if(message) return res.json({message});
    res.cookie(CookieKeys.EmailOTP,token,CookieOptionsToken());
    res.json({
      code,
      message:AuthMessage.SentOtp
    })
  }
}
