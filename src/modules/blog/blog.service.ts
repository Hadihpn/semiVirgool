import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { Repository } from "typeorm";
import { CreateBlogDto } from "./dto/blog.dto";
import { make_slug } from "src/common/utils/slugify.util";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogStatusEnum } from "./enum/status.enum";
import { AuthMessage, PublicMessage } from "src/common/enum/message.enum";
import { randomId } from "src/common/utils/function.util";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  async createBlog(blogDto: CreateBlogDto) {
    const user = this.request.user!;
    let { title, slug, description, image, time_for_study } = blogDto;
    let slugData = slug ?? title;
    blogDto.slug = make_slug(slugData);
    const isExist = await this.checkBlogBySlug(slug);
    if (isExist) {
      slug += `-${randomId()}`;
    }
    blogDto.title = title.trim();

    const blog = await this.blogRepository.create({
      title: blogDto.title,
      description,
      image,
      status: BlogStatusEnum.Draft,
      time_for_study,
      slug: blogDto.slug,
      authorId: user.id,
    });
    await this.blogRepository.save(blog);
    return {
      message: PublicMessage.Created,
    };
  }
  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });
    return !!blog;
  }
  async myBlogs() {
    const user = this.request.user!;
    if (!user) throw new UnauthorizedException(AuthMessage.LoginAgain);
    const blogs = await this.blogRepository.find({
      where: { authorId: user.id },
      order: {
        id: "DESC",
      },
    });
  }
}
