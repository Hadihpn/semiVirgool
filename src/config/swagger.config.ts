import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication): void {
  const document = new DocumentBuilder()
    .setTitle("SemiVirgool API")
    .setDescription("SemiVirgool API description")
    .setVersion("0.0.0")
    .addBearerAuth(SwaggerAuthConfig(),"Authorization")
    .build();
  const swagger = SwaggerModule.createDocument(app, document);
  SwaggerModule.setup("/swagger", app, swagger);
}
function SwaggerAuthConfig(): SecuritySchemeObject {
  return {
    type: "http",
    bearerFormat: "JWT",
    in: "header",
    scheme: "bearer",
  };
}
