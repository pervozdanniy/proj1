import { IsInt, IsNotEmpty } from 'class-validator';
import { IdRequest } from '~common/grpc/interfaces/common';

export class RequestByIdDto implements IdRequest {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
