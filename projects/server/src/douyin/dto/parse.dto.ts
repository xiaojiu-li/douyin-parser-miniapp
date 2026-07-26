import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ParseDto {
  @IsString()
  @IsNotEmpty({ message: '请提供抖音分享文本' })
  @MaxLength(2000)
  text!: string;
}
