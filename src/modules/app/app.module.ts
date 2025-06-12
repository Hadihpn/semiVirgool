import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from '../../config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal:true,
    envFilePath:join(process.cwd(),".env")
  }),
  TypeOrmModule.forRoot(TypeOrmConfig()),
UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
