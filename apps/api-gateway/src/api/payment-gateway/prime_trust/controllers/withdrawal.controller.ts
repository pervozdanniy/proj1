import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  WithdrawalResponseDTO,
  WithdrawalsDataResponseDTO,
} from '@/api/payment-gateway/prime_trust/utils/prime-trust-response.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { ResourceDto } from '../dtos/deposit/resource.dto';
import { WithdrawalMakeDto } from '../dtos/withdrawal/withdrawal-make.dto';
import { WithdrawalParamsDto } from '../dtos/withdrawal/withdrawal-params.dto';

@ApiTags('Prime Trust/Withdrawal Funds')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'withdrawal',
})
export class WithdrawalController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Get Withdrawal by id.' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @JwtSessionAuth()
  @Get('/')
  async getWithdrawalById(@JwtSessionUser() { id }: User, @Query() query: ResourceDto) {
    return this.paymentGatewayService.getWithdrawalById({ id, resource_id: query.resource_id });
  }

  @ApiOperation({ summary: 'Get Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: WithdrawalsDataResponseDTO,
  })
  @JwtSessionAuth()
  @Get('/params')
  async getWithdrawalParams(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.getWithdrawalParams({ id });
  }

  @ApiOperation({ summary: 'Add Bank params for withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WithdrawalResponseDTO,
  })
  @JwtSessionAuth()
  @Post('/params')
  async addWithdrawalParams(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalParamsDto) {
    return this.paymentGatewayService.addWithdrawalParams({ id, ...payload });
  }

  @ApiOperation({ summary: 'Make withdrawal.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/make')
  async makeWithdrawal(@JwtSessionUser() { id }: User, @Body() payload: WithdrawalMakeDto) {
    return this.paymentGatewayService.makeWithdrawal({ id, ...payload });
  }
}
