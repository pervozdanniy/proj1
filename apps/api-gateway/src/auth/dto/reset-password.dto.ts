import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length, ValidateIf } from 'class-validator';
import { ResetPasswordFinishRequest, ResetPasswordStartRequest } from '~common/grpc/interfaces/auth';
import { TwoFactorVerificationDto } from './2fa.request.dto';

export class ResetPasswordStartDto implements ResetPasswordStartRequest {
  @ApiPropertyOptional({ example: 'test453_sd@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((obj: ResetPasswordStartDto) => !obj.phone)
  email?: string;

  @ApiPropertyOptional({ example: '+37495017680' })
  @IsPhoneNumber()
  @IsNotEmpty()
  @ValidateIf((obj: ResetPasswordStartDto) => !obj.email)
  phone?: string;
}

export class ResetPasswordVerifyDto extends TwoFactorVerificationDto {}

export class ResetPasswordFinishDto implements ResetPasswordFinishRequest {
  @ApiProperty({ example: '12345678' })
  @IsNotEmpty()
  @IsString()
  @Length(8, 200)
  password: string;
}
