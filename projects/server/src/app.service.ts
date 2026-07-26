import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '抖音解析服务运行中 ✅';
  }
}
