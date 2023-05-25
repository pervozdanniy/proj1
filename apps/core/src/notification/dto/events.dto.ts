import { ApiExtraModels, ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { BaseNotificationEvent } from '../interfaces/event.interface';

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

export class EventDto implements BaseNotificationEvent {
  @ApiProperty({ enum: ['payment_account_creation', 'balance_updated', 'kyc'] })
  type: string;
  @ApiExtraModels(KYCEventData, PaymentAccountCreationData)
  @ApiProperty({ oneOf: [{ $ref: getSchemaPath(KYCEventData) }] })
  data?: Record<string, unknown>;
}
