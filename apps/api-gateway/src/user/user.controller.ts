import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { User } from '~common/grpc/interfaces/common';
import { JwtSessionAuth, JwtSessionUser } from '../auth';
import { ContactsResponseDto } from '../utils/contacts.dto';
import { PublicUserDto, PublicUserWithContactsDto } from '../utils/public-user.dto';
import { GetContactsDto } from './dtos/get-contacts.dto';
import { LatestRecepientsResponseDto } from './dtos/latest-recepients.dto';
import { UpdateUserDto, UserContactsDto } from './dtos/update-user.dto';
import { UserService } from './services/user.service';

@ApiTags('User')
@Controller({
  version: '1',
  path: 'users',
})
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get all contacts.' })
  @ApiOkResponse({ type: ContactsResponseDto })
  @ApiBearerAuth()
  @JwtSessionAuth()
  @Get('contacts')
  async getContacts(@JwtSessionUser() { id }: User, @Query() query: GetContactsDto) {
    return this.userService.getContacts({ user_id: id, ...query });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Get latest user transfers' recepients" })
  @ApiOkResponse({ type: LatestRecepientsResponseDto })
  @JwtSessionAuth()
  @Get('latest_recepients')
  getLatestRecepients(
    @Query('limit', new ParseIntPipe()) limit: number,
    @JwtSessionUser() { id }: User,
  ): Promise<LatestRecepientsResponseDto> {
    return this.userService.getLatestRecepients({ user_id: id, limit });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authorized user info from db' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserWithContactsDto })
  @HttpCode(HttpStatus.OK)
  @JwtSessionAuth()
  @Get('current')
  async getCurrent(@JwtSessionUser() { id }: User) {
    const user = await this.userService.getById(id);

    return plainToInstance(PublicUserWithContactsDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user.' })
  @ApiOkResponse({
    description: 'The user updated successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Put()
  async update(@JwtSessionUser() { id }: User, @Body() payload: UpdateUserDto): Promise<PublicUserDto> {
    const request = { ...payload, id };
    const user = await this.userService.update(request);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user avatar.' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: PublicUserDto })
  @UseInterceptors(FileInterceptor('avatar'))
  @JwtSessionAuth()
  @Put('/avatar')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(
    @JwtSessionUser() { id }: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    const user = await this.userService.upload(id, { avatar });

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove avatar.' })
  @ApiOkResponse({
    description: 'The user updated successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Delete('/remove/avatar')
  async removeAvatar(@JwtSessionUser() { id }: User): Promise<PublicUserDto> {
    const user = await this.userService.removeAvatar(id);

    return plainToInstance(PublicUserDto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user`s contacts list.' })
  @ApiResponse({
    description: 'The user`s contacts added successfully.',
    type: PublicUserDto,
  })
  @JwtSessionAuth()
  @Patch('contacts')
  async updateContacts(@JwtSessionUser() { id }: User, @Body() payload: UserContactsDto): Promise<PublicUserDto> {
    const user = await this.userService.updateContacts(id, payload);

    return plainToInstance(PublicUserDto, user);
  }
}
