import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionUser } from '../../auth';
import { ExternalBalanceResponseDto } from '../dtos/external-balance/external-balance.dto';
import { ExternalBalanceService } from '../services/external-balance.service';

@ApiTags('External Balance')
@Controller({ version: '1', path: 'external_balance' })
export class ExternalBalanceController {
  constructor(private readonly balance: ExternalBalanceService) {}

  @ApiOperation({ summary: "User's external balance" })
  @ApiOkResponse({ type: ExternalBalanceResponseDto })
  @ApiBearerAuth()
  @Get()
  get(@JwtSessionUser() { id }: User): Promise<ExternalBalanceResponseDto> {
    return this.balance.getBalance(id);
  }
}
