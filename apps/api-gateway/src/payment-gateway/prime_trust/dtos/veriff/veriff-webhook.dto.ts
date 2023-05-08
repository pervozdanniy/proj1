import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class VerificationPersonDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  gender?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  idNumber?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  citizenship?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  nationality?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  yearOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  placeOfBirth?: string;

  @IsOptional()
  @ApiProperty()
  pepSanctionMatch?: boolean;
}

class VerificationDocumentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  number: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  country: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  validFrom?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  validUntil?: string;
}

class VerificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;

  @IsNotEmpty()
  @ApiProperty()
  code: number;

  @IsOptional()
  @ApiProperty()
  person: VerificationPersonDto;

  @IsOptional()
  @IsString()
  @ApiProperty()
  reason?: string;

  @IsNotEmpty()
  @ApiProperty()
  status: string;

  @ApiProperty({ type: () => [String] })
  comments: string[];

  @IsNotEmpty()
  @ApiProperty()
  document: VerificationDocumentDto;

  @IsOptional()
  @IsString()
  @ApiProperty()
  reasonCode?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  vendorData: string;

  @IsNotEmpty()
  @ApiProperty({ type: () => String })
  decisionTime: string;

  @IsNotEmpty()
  @ApiProperty({ type: () => String })
  acceptanceTime: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  additionalVerifiedData: { [key: string]: string };
}

class TechnicalDataDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  ip: string;
}

export class VeriffWebhookDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: string;

  @IsNotEmpty()
  @ApiProperty()
  verification: VerificationDto;

  @IsNotEmpty()
  @ApiProperty()
  technicalData: TechnicalDataDto;
}
