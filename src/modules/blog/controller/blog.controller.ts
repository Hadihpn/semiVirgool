import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";

import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { make_slug } from "src/common/utils/slugify.util";
import { ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decorator/skipAuth.ecorator";
import { FilterBlog } from "src/common/decorator/filter.decorator";
import { BlogService } from "../services/blog.service";

@Controller("blog")
@UseGuards(AuthGuard)
@ApiBearerAuth("Authorization")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
  @Post("create_blog")
  @SkipAuth()
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  createBlog(@Body() blogDto: CreateBlogDto) {
    return this.blogService.createBlog(blogDto);
  }
  @Get("myBlog")
  myBlogs() {
    return this.blogService.myBlogs();
  }
  @Get("")
  @SkipAuth()
  @Pagination()
  @FilterBlog()
  blogs(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterBlogDto
  ) {
    return this.blogService.blogsList(paginationDto, filterDto);
  }
  @Delete(":id")
  deleteBlog(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
  @Put(":id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  updateBlog(@Param("id", ParseIntPipe) id: number, blogto: UpdateBlogDto) {
    return this.blogService.update(id, blogto);
  }
  @Put("like/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  likeToggle(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id);
  }
  @Put("bookmark/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  likeBookmark(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.bookmarkToggle(id);
  }
  @Get("likesCount/:id")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  getBlogLike(@Param("id", ParseIntPipe) id: number) {
    return this.blogService.likesCount(id);
  }
}
