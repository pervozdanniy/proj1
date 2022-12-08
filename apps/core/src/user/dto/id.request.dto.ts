import { IsInt, IsNotEmpty } from 'class-validator';
import { IdRequest } from '~common/grpc/interfaces/core';

export class IdRequestDto implements IdRequest {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
