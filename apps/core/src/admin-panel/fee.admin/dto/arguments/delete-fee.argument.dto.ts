import { IsInt, IsNotEmpty } from 'class-validator';
import { IdRequest } from '~common/grpc/interfaces/common';

export class DeleteFeeArgumentDto implements IdRequest {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
