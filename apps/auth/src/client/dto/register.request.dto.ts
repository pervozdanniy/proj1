import { IsISO31661Alpha2, IsNotEmpty, IsString } from 'class-validator';

export class SignedRegisterRequest {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsISO31661Alpha2()
  countryCode: string;
}

export class UnsignedRegisterRequest extends SignedRegisterRequest {
  @IsNotEmpty()
  @IsString()
  password: string;
}
