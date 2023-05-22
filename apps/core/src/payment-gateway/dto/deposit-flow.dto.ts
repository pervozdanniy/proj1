import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { DepositFlowRequest } from '~common/grpc/interfaces/payment-gateway';
import { PaymentMethod } from '../interfaces/payment-gateway.interface';

export class DepositFlowStartRequestDto implements DepositFlowRequest {
  @IsNotEmpty()
  @IsInt()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  currency: string;

  @IsNotEmpty()
  @IsIn(['credit-card', 'bank-transfer', 'cash'])
  type: PaymentMethod;
}
