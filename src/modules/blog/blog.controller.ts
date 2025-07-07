import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/blog.dto";
import { make_slug } from "src/common/utils/slugify.util";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { AuthGuard } from "../auth/guards/auth.guard";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";

@Controller("blog")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
  @Post("create_blog")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  createBlog(@Body() blogDto: CreateBlogDto) {
    return this.blogService.createBlog(blogDto);
   
  }
  @Get("myBlog")
  myBlogs(){
    return this.blogService.myBlogs()
  }
   @Get("")
   @Pagination()
  blogs(@Query() paginationDto:PaginationDto){
    return this.blogService.blogsList(paginationDto)
  }
}
