import { IsIn, IsInt, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { DepositFlowRequest } from '~common/grpc/interfaces/payment-gateway';
import { PaymentMethod } from '../interfaces/payment-gateway.interface';

export class DepositFlowStartRequestDto implements DepositFlowRequest {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  currency: string;

  @IsNotEmpty()
  @IsIn(['credit-card', 'bank-transfer', 'cash'])
  type: PaymentMethod;
}
