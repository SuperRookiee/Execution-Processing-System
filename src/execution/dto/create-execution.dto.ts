import { IsNumber, IsString, Length } from 'class-validator';

export class CreateExecutionDto {
  // 요청 타임스탬프 숫자 검증
  @IsNumber()
  timestamp!: number;

  // 10자리 랜덤 키 검증
  @IsString()
  @Length(10, 10)
  randomKey!: string;

  // 요청 인덱스 숫자 검증
  @IsNumber()
  index!: number;
}
