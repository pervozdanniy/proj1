import { ApiProperty } from '@nestjs/swagger';

export class UserDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  email_verified_at?: string;

  @ApiProperty()
  payment_gateway: string;

  constructor(partial: Partial<UserDTO>) {
    Object.assign(this, partial);
  }
}
