import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DecisionWebhook, EventWebhook } from '~common/grpc/interfaces/veriff';

class VerificationPersonDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  gender?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
  citizenship?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  nationality?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  yearOfBirth?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  placeOfBirth?: string;

  @IsOptional()
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
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
  @ApiProperty({ type: VerificationPersonDto })
  person: VerificationPersonDto;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
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

export class DecisionWebhookDto implements DecisionWebhook {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: string;

  @IsNotEmpty()
  @ApiProperty()
  verification: VerificationDto;

  @IsNotEmpty()
  @ApiProperty({ type: TechnicalDataDto })
  technicalData: TechnicalDataDto;
}

export class EventWebhookDto implements EventWebhook {
  @ApiProperty()
  @IsString()
  id: string;
  @ApiProperty()
  @IsString()
  attemptId: string;
  @ApiProperty()
  @IsString()
  action: string;
}
