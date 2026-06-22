import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { AppModule } from './app.module';

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Date Poll API')
    .setVersion('DEV')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/swagger', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const PORT = 4000;
  const isProductionStage = config.get('STAGE') === 'production';
  const isProductionEnv = config.get('NODE_ENV') === 'production';

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(morgan(isProductionEnv ? 'common' : 'dev'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (!isProductionStage) setupSwagger(app);

  await app.listen(PORT);
  console.log(`API server running on port ${PORT}`);
}
bootstrap();
