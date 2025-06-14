import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './config/typeorm.config';

@Module({
  imports: [TypeOrmModule.forRootAsync({
    useClass:TypeOrmDbConfig,
    inject: [TypeOrmDbConfig],
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
