import { IsNotEmpty, ValidateIf } from 'class-validator';
import { FindRequestDto } from './find.request.dto';

export class FindBySocialIdDto {
  @ValidateIf((obj: FindRequestDto) => !obj.email && !obj.phone)
  @IsNotEmpty()
  social_id?: string;
}
