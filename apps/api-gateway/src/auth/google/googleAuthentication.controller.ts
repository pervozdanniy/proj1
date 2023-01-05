import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleAuthenticationService } from './googleAuthentication.service';
import TokenVerificationDto from './tokenVerification.dto';

@ApiTags('Google')
@Controller('google-authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class GoogleAuthenticationController {
  constructor(private readonly googleAuthenticationService: GoogleAuthenticationService) {}

  @Post()
  async authenticate(@Body() tokenData: TokenVerificationDto) {
    const data = await this.googleAuthenticationService.authenticate(tokenData.token);

    return data;
  }
}
