import {
  Injectable,
  Controller,
  Body,
  ConflictException,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiConflictResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PublicUserDto } from '../../utils/public-user.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UserService } from '../user.service';

@ApiTags('Register')
@Injectable()
@Controller({
  version: '1',
  path: 'register',
})
@UseInterceptors(ClassSerializerInterceptor)
export class RegisterController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @ApiConflictResponse({ description: 'User already exists' })
  @HttpCode(HttpStatus.OK)
  @Post()
  async register(@Body() data: RegisterDto) {
    const user = await this.userService.findByLogin(data.email);
    if (user) {
      throw new ConflictException('User already exists');
    }
    const newUser = await this.userService.create(data);

    return plainToInstance(PublicUserDto, newUser);
  }
}
