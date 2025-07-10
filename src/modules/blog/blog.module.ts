import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { BlogLikeEntity } from './entities/like.entity';
import { UserEntity } from '../user/entities/user.entity';
import { BlogCategoryEntity } from './entities/blog-category.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([BlogEntity,BlogLikeEntity,UserEntity,BlogCategoryEntity,CategoryEntity])],
  controllers: [BlogController],
  providers: [BlogService,CategoryService],
})
export class BlogModule {}
