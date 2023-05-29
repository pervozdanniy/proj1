import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '../auth';
import { ExternalBalanceResponseDto } from '../payment-gateway/dtos/external-balance/external-balance.dto';
import { BalanceRequestDto } from '../payment-gateway/dtos/main/balance.dto';
import { GetTransfersDto } from '../payment-gateway/dtos/transfer/get-transfers.dto';
import { BalanceResponseDto, TransactionResponseDto } from '../payment-gateway/utils/prime-trust-response.dto';
import { AccountService } from './account.service';

@ApiTags('Account')
@Controller({ version: '1', path: 'account' })
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @ApiOperation({ summary: 'Get Balance.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: BalanceResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/balance')
  async balance(@Query() query: BalanceRequestDto, @JwtSessionUser() { id }: User) {
    return this.account.balance(id, query.currencies);
  }

  @ApiOperation({ summary: "User's external balance" })
  @ApiOkResponse({ type: ExternalBalanceResponseDto })
  @ApiBearerAuth()
  @Get('/balance/external')
  externalBalance(@JwtSessionUser() { id }: User): Promise<ExternalBalanceResponseDto> {
    return this.account.externalBalance(id);
  }

  @ApiOperation({ summary: 'Get all transactions.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: TransactionResponseDto,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('/transactions')
  async getTransactions(@JwtSessionUser() { id }: User, @Query() query: GetTransfersDto) {
    return this.account.transactions({ user_id: id, ...query });
  }
}
