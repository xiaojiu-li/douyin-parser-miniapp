import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DouyinModule } from './douyin/douyin.module';

@Module({
  imports: [HttpModule, DouyinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
