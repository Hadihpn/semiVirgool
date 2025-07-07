import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { BlogLikeEntity } from './entities/like.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([BlogEntity,BlogLikeEntity,UserEntity])],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
