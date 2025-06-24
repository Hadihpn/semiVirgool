import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle("SemiVirgool API")
    .setDescription("SemiVirgool API description")
    .setVersion("0.0.0")
    .build();
  const swagger = SwaggerModule.createDocument(app, document);
    SwaggerModule.setup("/swagger", app, swagger)
}
