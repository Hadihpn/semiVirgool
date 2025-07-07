import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "../../config/typeorm.config";
import { ConfigModule } from "@nestjs/config";
import { join } from "path";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { CategoryModule } from "../category/category.module";
import { BlogModule } from "../blog/blog.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    TypeOrmModule.forRoot(TypeOrmConfig()),
    AuthModule,
    UserModule,
    CategoryModule,
    BlogModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
