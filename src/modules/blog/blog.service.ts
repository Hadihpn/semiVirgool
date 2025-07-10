import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "./entities/blog.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto } from "./dto/blog.dto";
import { make_slug } from "src/common/utils/slugify.util";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogStatusEnum } from "./enum/status.enum";
import {
  AuthMessage,
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enum/message.enum";
import { randomId } from "src/common/utils/function.util";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import {
  PaginationGenerator,
  PaginationSolver,
} from "src/common/utils/pagination.util";
import { CategoryService } from "../category/category.service";
import { isArray } from "class-validator";
import { BlogCategoryEntity } from "./entities/blog-category.entity";
import { EntityEnum } from "src/common/enum/entity.enum";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService
  ) {}
  async createBlog(blogDto: CreateBlogDto) {
    const user = this.request.user!;
    let { title, slug, description, image, time_for_study, categories } =
      blogDto;
    if (typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray(categories)) {
      throw new BadRequestException(BadRequestMessage.InValidCategoryData);
    }

    let slugData = slug ?? title;
    blogDto.slug = make_slug(slugData);
    const isExist = await this.checkBlogBySlug(slug);
    if (isExist) {
      slug += `-${randomId()}`;
    }
    blogDto.title = title.trim();

    let blog = await this.blogRepository.create({
      title: blogDto.title,
      description,
      image,
      status: BlogStatusEnum.Draft,
      time_for_study,
      slug: blogDto.slug,
      authorId: user.id,
    });
    blog = await this.blogRepository.save(blog);
    for (const categoryTitle of categories) {
      let category = await this.categoryService.insertByTitle(categoryTitle);
      await this.blogCategoryRepository.create({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
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
  async blogsList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { page, limit, skip } = PaginationSolver(paginationDto);
    let { category, search } = filterDto;
    // const where:FindOptionsWhere<BlogEntity> = {}
    let where = "";
    if (category) {
      category = category.trim().toLowerCase();
      if (where.length > 0) where += " AND ";
      where += `category.title = LOWER(:category)`;
      // where.categories = {
      //   category: {
      //     title: category,
      //   },
      // };
    }
    if (search) {
      if (where.length > 0) where += " AND ";
      search = `%${search}%`;
      where += "CONCAT(blog.title, blog.description) ILIKE :search";
    }
    const [blogs, count] = await this.blogRepository
      .createQueryBuilder(EntityEnum.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .addSelect(["categories.id", "category.title"])
      .where(where, { category, search })
      .orderBy("blog.id", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    // await this.blogRepository.findAndCount({
    //   relations:{
    //     categories:true
    //   },
    //   where,
    //   order: {
    //     id: "DESC",
    //   },
    //   select:{
    //     categories:{
    //       id: true,
    //       category: {
    //         id: true,
    //         title: true,
    //       },
    //     }
    //   },
    //   skip,
    //   take: limit,
    // });
    return {
      pagination: PaginationGenerator(count, page, limit),
      blogs,
    };
  }
  async findBlogById(id: number) {
    const blog = this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    return blog;
  }
  async delete(id){
    await this.findBlogById(id);
    await this.blogRepository.delete({id});
    return {
      message:PublicMessage.Deleted
    }
  }
}
