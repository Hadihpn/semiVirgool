import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { Repository } from "typeorm";
import { BlogCommentEntity } from "../entities/comment.entity";
import { REQUEST } from "@nestjs/core";
import { CreateCommentDto } from "../dto/comment.to";
import { BlogService } from "./blog.service";

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    private blogService: BlogService
  ) {}
  async createComment(commentDto: CreateCommentDto) {
    let { text, blogId, parentId } = commentDto;

    let parent;
    const userId = await this.blogService.checkLogin();
    await this.blogService.findBlogById(blogId);
    if (parentId && !isNaN(parentId)) {
      parent = await this.blogCommentRepository.findOneBy({
        id: +parentId,
        blogId,
      });
    }
    await this.blogCommentRepository.insert({
      accepted: true,
      text,
      blogId,
      parentId: parent ? parentId : null,
      userId,
    });
  }
}
