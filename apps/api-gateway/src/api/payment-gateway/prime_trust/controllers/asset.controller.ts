import { JwtSessionAuth, JwtSessionUser } from '@/api/auth';
import { PaymentGatewayService } from '@/api/payment-gateway/prime_trust/services/payment-gateway.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';
import { CreateWalletDto } from '../dtos/asset/create-wallet.dto';

@ApiTags('Prime Trust/Assets')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'assets',
})
export class AssetController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Create wallet for deposit assets in Prime Trust.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/create/wallet')
  async createWallet(@JwtSessionUser() { id }: User, @Body() payload: CreateWalletDto) {
    return this.paymentGatewayService.createWallet({ id, label: payload.label });
  }
}
