import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { SwaggerConfigInit } from './config/swagger.config';
import * as cookieParser from "cookie-parser";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerConfigInit(app); 
  app.use(cookieParser(process.env.COOKIE_SECRET));
  const {PORT} =process.env;
  await app.listen(PORT,()=>{
    console.log(`server is run on: http://localhost:${PORT}`);
    console.log(`swagger is run on: http://localhost:${PORT}/swagger`);
    
  });
}
bootstrap();
