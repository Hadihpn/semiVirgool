import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, Length } from "class-validator";
import { GenderEnum } from "../enum/gender.enum";

export class ProfileDto {
    @ApiPropertyOptional()
      nick_name: string;
      @Length(3,100)
      @ApiPropertyOptional({ nullable: true })
      @Length(10,200)
      bio: string;
      @ApiPropertyOptional({ nullable: true ,format: 'binary'})
      image_profile: string;
      @ApiPropertyOptional({ nullable: true })
      bg_image: string;
      @ApiPropertyOptional({ nullable: true ,enum:GenderEnum,example: GenderEnum.Man})
      @IsEnum(GenderEnum)
      gender: string;
      @ApiPropertyOptional({nullable:true,example: '1990-01-01T00:00:00.000Z'})
      birtdate: Date;
      @ApiPropertyOptional({nullable:true,example: 'https://www.linkedin.com/in/username'})
      linkdin_profile: string;
}