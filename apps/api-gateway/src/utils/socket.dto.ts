import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';

export class KYCEventData {
  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  reason?: string;
}

export class PaymentAccountCreationData {
  @ApiProperty()
  completed: boolean;

  @ApiPropertyOptional()
  reason?: string;
}

@ApiExtraModels(KYCEventData, PaymentAccountCreationData)
export class NotificationEventDto {
  @ApiProperty({ enum: ['payment_account_creation', 'balance_updated', 'kyc'] })
  type: string;

  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(KYCEventData) }, { $ref: getSchemaPath(PaymentAccountCreationData) }] })
  data?: Record<string, unknown>;
}
