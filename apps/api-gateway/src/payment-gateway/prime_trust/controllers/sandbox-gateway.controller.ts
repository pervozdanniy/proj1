import { SandboxService } from '@/payment-gateway/prime_trust/services/sandbox.service';
import { Body, ClassSerializerInterceptor, Controller, HttpStatus, Patch, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeController, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtSessionAuth } from '~common/http-session';
import { CardResourceDto } from '../dtos/deposit/card-resource.dto';
import { WebhookUrlDto } from '../dtos/sandbox/webhook-url.dto';

@ApiTags('Prime Trust/Sandbox')
@ApiBearerAuth()
@ApiExcludeController()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({
  version: '1',
  path: 'sandbox',
})
export class SandboxGatewayController {
  constructor(private sandboxService: SandboxService) {}

  @ApiOperation({ summary: 'Bind existed accounts to current webhook.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Patch('/webhook/change')
  async bind(@Body() payload: WebhookUrlDto) {
    return this.sandboxService.bind(payload);
  }

  @ApiOperation({ summary: 'Get Credit Card Descriptor for verification 4 digits).' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @JwtSessionAuth()
  @Post('/card/verification/number')
  async getCardDescriptor(@Body() payload: CardResourceDto) {
    return this.sandboxService.getCardDescriptor(payload);
  }
}
