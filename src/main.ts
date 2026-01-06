import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Liquid } from 'liquidjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  const config = new DocumentBuilder()
    .setTitle('Builder6 Play API')
    .setDescription('The Builder6 Play API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const engine = new Liquid({
    root: join(__dirname, '..', 'views'),
    extname: '.liquid',
  });
  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(process.env.PORT ?? 3000);
}

if (require.main === module) {
  bootstrap();
}

export default async (req: any, res: any) => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  const engine = new Liquid({
    root: join(__dirname, '..', 'views'),
    extname: '.liquid',
  });
  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
