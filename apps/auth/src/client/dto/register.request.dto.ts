import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SignedRegisterRequest {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsInt()
  countryId: number;
}

export class UnsignedRegisterRequest extends SignedRegisterRequest {
  @IsNotEmpty()
  @IsString()
  password: string;
}
