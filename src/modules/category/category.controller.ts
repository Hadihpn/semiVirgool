import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiConsumes, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { CanAccess } from "src/common/decorator/role.decorator";
import { Roles } from "src/common/enum/roles.enum";

@Controller("category")
@ApiTags("Category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  @Pagination()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(":id")
   @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param("id",ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @CanAccess(Roles.Admin)
   @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  remove(@Param("id",ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
