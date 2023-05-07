import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { PublicUserDto } from '../../utils/public-user.dto';
import { JwtSessionAuth, JwtSessionUser } from '../decorators/jwt-session.decorators';

@ApiTags('Auth')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @ApiUnauthorizedResponse()
  @JwtSessionAuth({ allowClosed: true })
  @Get('me')
  async me(@JwtSessionUser() user: User) {
    return plainToInstance(PublicUserDto, user);
  }
}
