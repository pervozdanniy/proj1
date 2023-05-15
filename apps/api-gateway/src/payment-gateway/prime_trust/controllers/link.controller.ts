import { JwtSessionAuth, JwtSessionUser } from '@/auth';
import { PaymentGatewayService } from '@/payment-gateway/prime_trust/services/payment-gateway.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '~common/grpc/interfaces/common';

@ApiTags('Link')
@ApiExcludeController()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'link',
})
export class LinkController {
  private readonly logger = new Logger(LinkController.name);
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  @ApiOperation({ summary: 'Create link session.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Post('/link/session')
  async linkSession(@JwtSessionUser() { id }: User) {
    return this.paymentGatewayService.linkSession({ id });
  }

  @ApiOperation({ summary: 'Create link session.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Get('/customer/:sessionId')
  async saveCustomer(@Param('sessionId') sessionId: string, @Query('customerId') customerId: string) {
    return this.paymentGatewayService.saveCustomer({ sessionId, customerId });
  }

  @ApiOperation({ summary: 'Catch webhooks.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Post('/webhook')
  async webhook(@Body() payload: any) {
    this.logger.log(payload);
  }
}
