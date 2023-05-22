import { ApiProperty } from '@nestjs/swagger';
import { ExternalBalanceEntry, ExternalBalanceResponse } from '~common/grpc/interfaces/inswitch';

class BalanceEntryDto implements ExternalBalanceEntry {
  @ApiProperty()
  currency: string;
  @ApiProperty()
  amount: number;
}

export class ExternalBalanceResponseDto implements ExternalBalanceResponse {
  @ApiProperty({ type: BalanceEntryDto, isArray: true })
  balance: ExternalBalanceEntry[];
}
