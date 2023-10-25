import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setear prefijo global
  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // Trasforma la información que circula por los DTO
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.listen( process.env.PORT );
}
bootstrap();
