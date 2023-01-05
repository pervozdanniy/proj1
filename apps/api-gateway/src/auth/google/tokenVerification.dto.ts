import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenVerificationDto {
  @ApiProperty({
    default:
      'ya29.a0AX9GBdWq5N-4yuGVEUdomWEoIe5hnWXxuxkxy6-a50zCoBxqKmfbJJkmEhbcwuiikvNY2YEaHU20sq5Hh33V8y7J9Uzrz204G8z1ZGedDrKFSzbb2dPyI4IaDnDm2NTdADRhO0Eokr15jIkSICgwkPVig09CaCgYKAQgSARESFQHUCsbCuMVHZEdlc5ngZSQR1zXT1g0163',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export default TokenVerificationDto;
