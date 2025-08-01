import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogEntity } from "../entities/blog.entity";
import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from "../dto/blog.dto";
import { make_slug } from "src/common/utils/slugify.util";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { BlogStatusEnum } from "../enum/status.enum";
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
import { CategoryService } from "../../category/category.service";
import { isArray } from "class-validator";
import { BlogCategoryEntity } from "../entities/blog-category.entity";
import { EntityEnum } from "src/common/enum/entity.enum";
import { BlogLikeEntity } from "../entities/like.entity";
import { BlogBookmarkEntity } from "../entities/bookmark.entity";
import { CommentService } from "./comment.service";

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @InjectRepository(BlogLikeEntity)
    private blogLikeRepository: Repository<BlogLikeEntity>,
    @InjectRepository(BlogBookmarkEntity)
    private blogBookmarkRepository: Repository<BlogBookmarkEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
    private commentService: CommentService,
    private dataSource: DataSource
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
    return blog;
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
      .leftJoin("blog.author", "author")
      .addSelect([
        "categories.id",
        "category.title",
        "author.user-name",
        "author.id",
        "profile.nick_name",
      ])
      .where(where, { category, search })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .loadRelationCountAndMap(
        "blog.comments",
        "blog.comments",
        "comments",
        (qb) => qb.where("comments.accepted = : accepted", { accepted: true })
      )
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
  async delete(id) {
    await this.findBlogById(id);
    await this.blogRepository.delete({ id });
    return {
      message: PublicMessage.Deleted,
    };
  }
  async update(id: number, blogDto: UpdateBlogDto) {
    const user = this.request.user;
    let { title, slug, description, image, time_for_study, categories } =
      blogDto;
    const blog = await this.findBlogById(id);
    if (!blog) throw new NotFoundException(NotFoundMessage.NotFoundPost);
    if (!isArray(categories) && typeof categories === "string") {
      categories = categories.split(",");
    } else if (!isArray(categories)) {
      throw new BadRequestException(BadRequestMessage.InValidCategoryData);
    }
    let slugData: string | null = null;
    if (title) {
      slugData = title;
      blog.title = title;
    }
    if (slug) slugData = slug;

    if (slugData) {
      slug = make_slug(slugData);
      const isExist = await this.checkBlogBySlug(slug!);
      if (isExist && isExist.id !== id) {
        slug += `-${randomId()}`;
      }
      blog.slug = slug!;
    }
    if (description) blog.description = description;
    if (image) blog.image = image;
    if (time_for_study) blog.time_for_study = time_for_study;
    await this.blogRepository.save(blog);
    if (categories && isArray(categories) && categories.length > 0) {
      await this.blogCategoryRepository.delete({ blogId: blog.id });
    }
    for (const categoryTitle of categories) {
      let category = await this.categoryService.findByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }
      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }
    return {
      message: PublicMessage.Updated,
    };
  }
  async likeToggle(blogId: number) {
    let message = PublicMessage.LikeBlog;
    const userId = await this.checkLogin();
    const blog = await this.findBlogById(blogId);
    let blogLike = await this.blogLikeRepository.findOneBy({
      blogId,
      userId: userId,
    });
    if (blogLike) {
      await this.blogLikeRepository.delete(blogLike);
      message = PublicMessage.DisLikeBlog;
    } else {
      await this.blogLikeRepository.insert({ blogId, userId: userId });
    }
    return {
      message,
    };
  }
  async bookmarkToggle(blogId: number) {
    let message = PublicMessage.BookmarkBlog;
    const userId = await this.checkLogin();
    const blog = await this.findBlogById(blogId);
    let blogBookmark = await this.blogBookmarkRepository.findOneBy({
      blogId,
      userId: userId,
    });
    if (blogBookmark) {
      await this.blogBookmarkRepository.delete(blogBookmark);
      message = PublicMessage.DisBookmarkBlog;
    } else {
      await this.blogBookmarkRepository.insert({ blogId, userId: userId });
    }
    return {
      message,
    };
  }
  async likesCount(blogId: number) {
    const userId = await this.checkLogin();
    const count = await this.blogLikeRepository.countBy({ blogId });
    const isLiked = await this.blogLikeRepository.existsBy({ blogId, userId });
    return {
      count,
      isLiked,
    };
  }
  async checkLogin() {
    const { id: userId } = this.request.user!;
    if (!userId) throw new UnauthorizedException(AuthMessage.LoginRequired);
    return userId;
  }
  async findOneBySlug(slug: string, paginationDto: PaginationDto) {
    const userId = await this.checkLogin();
    const blog = await this.blogRepository
      .createQueryBuilder(EntityEnum.Blog)
      .leftJoin("blog.categories", "categories")
      .leftJoin("categories.category", "category")
      .leftJoin("blog.author", "author")
      .addSelect([
        "categories.id",
        "category.title",
        "author.user-name",
        "author.id",
        "profile.nick_name",
      ])
      .where({ slug })
      .loadRelationCountAndMap("blog.likes", "blog.likes")
      .loadRelationCountAndMap("blog.bookmarks", "blog.bookmarks")
      .getOne();

    if (!blog) throw new NotFoundException(NotFoundMessage.NotFound);
    const isLiked = !!(await this.blogLikeRepository.findOneBy({
      userId,
      blogId: blog?.id,
    }));
    const isBookmarked = !!(await this.blogBookmarkRepository.findOneBy({
      userId,
      blogId: blog?.id,
    }));

    const commentsData = await this.commentService.findCommentsOfBlog(
      blog.id,
      paginationDto
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const suggestBlogs = await queryRunner.query(`
            WITH suggested_blogs AS (
                SELECT 
                    blog.id,
                    blog.slug,
                    blog.title,
                    blog.description,
                    blog.time_for_study,
                    blog.image,
                    json_build_object(
                        'username', u.username,
                        'author_name', p.nick_name,
                        'image', p.image_profile
                    ) AS author,
                    array_agg(DISTINCT cat.title) AS categories,
                    (
                        SELECT COUNT(*) FROM blog_likes
                        WHERE blog_likes."blogId" = blog.id
                    ) AS likes,
                    (
                        SELECT COUNT(*) FROM blog_bookmarks
                        WHERE blog_bookmarks."blogId" = blog.id
                    ) AS bookmarks,
                    (
                        SELECT COUNT(*) FROM blog_comments
                        WHERE blog_comments."blogId" = blog.id
                    ) AS comments
                FROM blog
                LEFT JOIN public.user u ON blog."authorId" = u.id
                LEFT JOIN profile p ON p."userId" = u.id
                LEFT JOIN blog_category bc ON blog.id = bc."blogId"
                LEFT JOIN category cat ON bc."categoryId" = cat.id
                GROUP BY blog.id, u.username, p.nick_name, p.image_profile
                ORDER BY RANDOM()
                LIMIT 3

            )
            SELECT * FROM suggested_blogs
        `);
    return { isLiked, isBookmarked, blog, commentsData };
  }
}
