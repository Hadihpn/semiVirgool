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
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enum/swagger-consumes.enums";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Pagination } from "src/common/decorator/pagination.decorator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { SkipAuth } from "src/common/decorator/skipAuth.ecorator";
import { CreateCommentDto } from "../dto/comment.to";
import { CommentService } from "../services/comment.service";
import { AuthDecorator } from "src/common/decorator/auth.decorator";

@Controller("blog-comment")
@ApiTags("Blog")
@AuthDecorator()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Post("create_comment")
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  createComment(@Body() commentDto: CreateCommentDto) {
    return this.commentService.createComment(commentDto);
  }
  @Get("")
  @Pagination()
  find(@Query() paginationDto: PaginationDto) {
    return this.commentService.getComments(paginationDto);
  }
  @Put("acception:/id")
  acception(@Param("id", ParseIntPipe) id: number) {
    return this.acception(id);
  }
}
