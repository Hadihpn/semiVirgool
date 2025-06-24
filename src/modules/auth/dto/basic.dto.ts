import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsPhoneNumber,
  IsString,
  Length,
} from "class-validator";
import { AuthType } from "../enums/type.enum";
import { AuthMethod } from "../enums/method.enum";

export class SignupDto {
  @IsEmail({}, { message: "your email is not valid" })
  email: string;
  @IsMobilePhone("fa-IR", {}, { message: "phone number is not valid" })
  phone: string;
  @IsString()
  userName: string;
}

export class AuthDto {
  @ApiProperty()
  @IsString()
  @Length(3,50, { message: "username must be between 3 and 50 characters" })
  username: string;
  @ApiProperty({enum:AuthType})
  @IsEnum(AuthType)
  type: string;
  @ApiProperty()
  @ApiProperty({enum:AuthMethod})
  @IsEnum(AuthMethod)
  method: AuthMethod;
}
export class CheckOtpDto {
  @ApiProperty()
  @IsString()
  @Length(5,5, { message: "code must be just 5 characters" })
  code: string;
  
}