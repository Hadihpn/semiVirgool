import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';

@Module({
  imports:[AuthModule,TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
