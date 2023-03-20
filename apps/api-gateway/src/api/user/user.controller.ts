import { UpdateUserDto, UserContactsDto } from '@/api/user/dtos/update-user.dto';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SuccessResponse, User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '../auth';
import { PublicUserDto, PublicUserWithContactsDto } from '../utils/public-user.dto';
import { GetContactsDto } from './dtos/get-contacts.dto';
import { VerifyUserDto } from './dtos/verify-user.dto';
import { UserService } from './services/user.service';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'users',
})
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all transactions.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('contacts')
  async getContacts(@JwtSessionUser() { id }: User, @Query() query: GetContactsDto) {
    return this.userService.getContacts({ user_id: id, ...query });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authorized user' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Get('current')
  async getCurrent(@JwtSessionUser() { id }: User) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserWithContactsDto })
  @ApiNotFoundResponse()
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserWithContactsDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user.' })
  @ApiResponse({
    description: 'The user updated successfully.',
    type: PublicUserDto,
  })
  @ApiConsumes('multipart/form-data')
  @JwtSessionAuth()
  @Put()
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @JwtSessionUser() { id }: User,
    @Body() payload: UpdateUserDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<PublicUserDto> {
    const request = { ...payload, id, avatar };
    const user = await this.userService.update(request);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user`s contacts.' })
  @ApiResponse({
    description: 'The user`s contacts created successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Patch('contacts')
  async updateContacts(@JwtSessionUser() { id }: User, @Body() payload: UserContactsDto): Promise<PublicUserDto> {
    const user = await this.userService.updateContacts(id, payload);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user`s contacts.' })
  @ApiResponse({
    description: 'The user`s contacts created successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Patch('verify')
  async verifySocure(@JwtSessionUser() { id }: User, @Body() payload: VerifyUserDto): Promise<SuccessResponse> {
    return this.userService.verifySocure({ id, ...payload });
  }
}
