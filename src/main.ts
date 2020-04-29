import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as ratelimit from 'express-rate-limit';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { ConfigService } from './config/config.service';

import { InitService } from './init/init.service';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

/* tslint:disable-next-line: no-var-requires */
const bodyParser = require('body-parser');
// tslint:disable-next-line: no-var-requires
require('body-parser-xml')(bodyParser);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const initService: InitService = app.get(InitService);
  app.use(
    bodyParser.xml({
      limit: '2MB', // Reject payload bigger than 1 MB
      xmlParseOptions: {
        normalize: true, // Trim whitespace inside text nodes
        normalizeTags: true, // Transform tags to lowercase
        explicitArray: false, // Only put nodes in array if >1
      },
    }),
  );
  app
    .use(helmet())
    .use(compression())
    .use(bodyParser.json({ limit: '20mb' }))
    .use(
      bodyParser.urlencoded({
        extended: true,
      }),
    )
    .use(
      ratelimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000000, // limit each IP to 100 requests per windowMs
      }),
    );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  );
  app.enableCors();
  const uploadedPath = join(__dirname, '../', 'upload');
  app.useStaticAssets(uploadedPath);
  const ApiOptions = new DocumentBuilder()
    .setTitle('商城API文档')
    .setDescription('商城API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .setSchemes('http', 'https')
    .build();
  initService.init();
  const ApiDocument = SwaggerModule.createDocument(app, ApiOptions, {
    include: [AppModule],
  });
  SwaggerModule.setup('swagger', app, ApiDocument);
  //

  await app.listen(config.port);
}
bootstrap();
