import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DouyinService } from './douyin.service';
import { ParseDto } from './dto/parse.dto';
import { ApiResponse, DouyinVideoInfo } from '../types';

@Controller('douyin')
export class DouyinController {
  constructor(private readonly service: DouyinService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parse(@Body() dto: ParseDto): Promise<ApiResponse<DouyinVideoInfo>> {
    const data = await this.service.parse(dto.text);
    return { code: 0, msg: 'success', data };
  }
}
