import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayModule } from './play/play.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PlayModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
