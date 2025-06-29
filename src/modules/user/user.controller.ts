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
} from "src/common/utils/multer.util";
import { AuthGuard } from "../auth/guards/auth.guard";

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
        storage: diskStorage({
          destination: multerDestination("user-profile"),
          filename: multerFilename,
        }),
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
    files: any,
    @Body() profileDto: ProfileDto
  ) {
    return this.userService.changeProfile(files, profileDto);
  }
}
