import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenResponseDto {
  @ApiProperty()
  valid: boolean;
}
