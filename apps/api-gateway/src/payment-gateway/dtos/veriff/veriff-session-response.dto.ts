import { ApiProperty } from '@nestjs/swagger';

export class VerificationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  vendorData: string;

  @ApiProperty()
  host: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  sessionToken: string;
}

export class VeriffSessionResponseDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  verification: VerificationDto;
}
