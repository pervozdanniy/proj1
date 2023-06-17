import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserStatusArgumentDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  status: string;
}
