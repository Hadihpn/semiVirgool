import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class CreateBlogDto {
  @ApiProperty()
  @IsString()
  @Length(5, 50)
  title: string;
  @ApiProperty()
  @IsString()
  slug: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  time_for_study: string;
  @ApiPropertyOptional({ format: "binary" })
  @IsOptional()
  @IsString()
  image: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(50, 300)
  description: string;
}
