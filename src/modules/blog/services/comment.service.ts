import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { IsNull, Repository } from "typeorm";
import { BlogCommentEntity } from "../entities/comment.entity";
import { REQUEST } from "@nestjs/core";
import { CreateCommentDto } from "../dto/comment.to";
import { BlogService } from "./blog.service";
import {
  CommentMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enum/message.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  PaginationGenerator,
  PaginationSolver,
} from "src/common/utils/pagination.util";

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    @Inject(forwardRef(() => BlogService))
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
    return {
      message: PublicMessage.CreatedComment,
    };
  }
  async getComments(paginationDto: PaginationDto) {
    const { page, limit, skip } = PaginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: {},
      relations: {
        blog: true,
        user: { profile: true },
      },
      select: {
        blog: {
          title: true,
        },
        user: {
          user_name: true,
          profile: {
            nick_name: true,
          },
        },
      },
      skip,
      take: limit,
      order: { id: "DESC" },
    });
    return {
      pagination: PaginationGenerator(count, page, limit),
      comments,
    };
  }
  async findCommentById(commentId: number) {
    const comment = await this.blogCommentRepository.findOneBy({
      id: commentId,
    });
    if (!comment) throw new NotFoundException(NotFoundMessage.NotFoundComment);
    return comment;
  }
  async toggleCommentAcception(commentId: number) {
    const comment = await this.findCommentById(commentId);
    let message;
    if (comment?.accepted) {
      comment.accepted = false;
      message = CommentMessage.RejectComment;
    } else {
      comment.accepted = true;
      message = CommentMessage.AccepetComment;
    }
    return {
      message,
    };
  }
  async findCommentsOfBlog(blogId: number, paginationDto: PaginationDto) {
    const { limit, page, skip } = PaginationSolver(paginationDto);
    const [comments, count] = await this.blogCommentRepository.findAndCount({
      where: {
        blogId,
        parentId: IsNull(),
      },
      relations: {
        user: { profile: true },
        children: {
          user: { profile: true },
          children: {
            user: { profile: true },
          },
        },
      },
      select: {
        parentId:true,
        user: {
          user_name: true,
          profile: {
            nick_name: true,
          },
        },
        children: {
          parentId:true,
          user: {
            user_name: true,
            profile: {
              nick_name: true,
            },
          },
          children: {
            user: {
              user_name: true,
              profile: {
                nick_name: true,
              },
            },
          },
        },
      },
      skip,
      take:limit
    
    });
  }
}
