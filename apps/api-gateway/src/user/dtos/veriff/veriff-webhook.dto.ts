import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';

class Document {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty()
  @IsString()
  validUntil: string;

  @ApiProperty()
  @IsString()
  placeOfIssue: string;

  @ApiProperty()
  @IsString()
  firstIssue: string;

  @ApiProperty()
  @IsString()
  issueNumber: string;

  @ApiProperty()
  @IsString()
  issuedBy: string;
}

class AdditionalVerifiedDataDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  B?: boolean;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  BFrom?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  BUntil?: string;
}

class RiskLabelDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsArray()
  @Type(() => String)
  sessionIds: string[];
}

class BiometricAuthenticationDto {
  @ApiProperty()
  @IsString()
  matchedSessionId: string;

  @ApiProperty()
  @IsString()
  matchedSessionVendorData: string;
}

class Verification {
  @ApiProperty({ example: '12df6045-3846-3e45-946a-14fa6136d78b' })
  id: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ type: Document })
  @ValidateNested()
  @IsOptional()
  @Type(() => Document)
  document: Document;

  @ApiProperty()
  @IsString()
  decisionTime: string;

  @ApiProperty()
  @IsString()
  acceptanceTime: string;

  @ValidateNested()
  @Type(() => AdditionalVerifiedDataDto)
  additionalVerifiedData: AdditionalVerifiedDataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RiskLabelDto)
  riskLabels: RiskLabelDto[];

  @ValidateNested()
  @Type(() => BiometricAuthenticationDto)
  biometricAuthentication: BiometricAuthenticationDto;
}

export class VeriffWebhookDto {
  @ApiProperty({ example: 'success' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ type: Verification })
  @ValidateNested()
  @IsOptional()
  @Type(() => Verification)
  verification: Verification;
}
