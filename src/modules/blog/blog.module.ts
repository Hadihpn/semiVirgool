import { Module } from '@nestjs/common';
import { BlogService } from './services/blog.service';
import { BlogController } from './controller/blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { BlogLikeEntity } from './entities/like.entity';
import { UserEntity } from '../user/entities/user.entity';
import { BlogCategoryEntity } from './entities/blog-category.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';
import { BlogCommentEntity } from './entities/comment.entity';
import { CommentService } from './services/comment.service';
import { BlogBookmarkEntity } from './entities/bookmark.entity';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([BlogEntity,BlogLikeEntity,UserEntity,BlogCategoryEntity,BlogBookmarkEntity,CategoryEntity,BlogCommentEntity])],
  controllers: [BlogController],
  providers: [BlogService,CategoryService,CommentService],
})
export class BlogModule {}
