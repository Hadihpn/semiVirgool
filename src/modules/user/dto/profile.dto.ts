import { ApiPropertyOptional } from "@nestjs/swagger";import { IsDate, IsEnum, IsOptional, IsString, IsUrl, Length } from "class-validator";
import { Transform } from "class-transformer";
import { GenderEnum } from "../enum/gender.enum";

export class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 50)
  nick_name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(10, 200)
  bio?: string;

  @ApiPropertyOptional({ nullable: true, format: 'binary' })
  @IsOptional()
  @IsString()
  image_profile?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  bg_image?: string;

  @ApiPropertyOptional({ nullable: true, enum: GenderEnum, example: GenderEnum.Man })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: string;

  @ApiPropertyOptional({ nullable: true, example: '1990-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  birthdate?: Date;

  @ApiPropertyOptional({ nullable: true, example: 'https://www.linkedin.com/in/username' })
  @IsOptional()
  @IsUrl()
  linkdine_profile?: string;
}